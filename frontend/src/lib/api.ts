import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export type UserRole = 'admin' | 'operator'

export type AuthUser = {
  id: number
  username: string
  role: UserRole
  is_active?: boolean
}

export type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  refresh_expires_in: number
  user: AuthUser
}

const ACCESS_TOKEN_KEY = 'aicompare.access_token'
const REFRESH_TOKEN_KEY = 'aicompare.refresh_token'
const USER_KEY = 'aicompare.user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  timeout: 15000
})

let refreshRequest: Promise<string> | null = null

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function storeSession(payload: LoginResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token)
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function refreshAccessToken() {
  if (!refreshRequest) {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearSession()
      return Promise.reject(new Error('missing refresh token'))
    }
    refreshRequest = axios
      .post<LoginResponse>(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken })
      .then((response) => {
        const currentUser = getStoredUser()
        const payload: LoginResponse = {
          ...response.data,
          user: response.data.user ?? currentUser ?? { id: 0, username: '', role: 'operator' }
        }
        storeSession(payload)
        return payload.access_token
      })
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes('/auth/login')) {
      original._retry = true
      try {
        original.headers.Authorization = `Bearer ${await refreshAccessToken()}`
        return api(original)
      } catch (refreshError) {
        clearSession()
        window.location.assign('/login')
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export async function login(username: string, password: string) {
  const response = await api.post<LoginResponse>('/auth/login', { username, password })
  storeSession(response.data)
  return response.data
}

export async function loadCurrentUser() {
  const response = await api.get<AuthUser>('/auth/me')
  localStorage.setItem(USER_KEY, JSON.stringify(response.data))
  return response.data
}

export default api
