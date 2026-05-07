import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import LoginBrandPanel from './components/login-brand-panel'
import LoginCard, { type LoginFormValues } from './components/login-card'
import { login } from '../../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: LoginFormValues) {
    setLoading(true)
    setError(null)
    try {
      const response = await login(values.username, values.password)
      navigate(response.user.role === 'admin' ? '/admin/plans' : '/operator/plans/1/annotate', { replace: true })
    } catch (err) {
      const detail = (err as AxiosError<{ detail?: string }>).response?.data?.detail
      setError(detail === 'AUTH_INVALID_CREDENTIALS' ? '账号或密码错误，请重新输入。' : '登录失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-[var(--color-bg-layout)]">
      <LoginBrandPanel />
      <section className="flex min-w-0 flex-1 items-center justify-center bg-[var(--color-bg-container)] p-24 lg:p-48">
        <LoginCard loading={loading} error={error} onSubmit={handleSubmit} />
      </section>
    </main>
  )
}
