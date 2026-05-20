import api from '../lib/api'
import {
  mockCreatePlanWithImport,
  mockFetchManualAnnotationDetail,
  mockFetchOwners,
  mockFetchPlan,
  mockFetchPlanAnnotations,
  mockFetchPlans,
  mockFetchPlanStats,
  mockImportPlanCsv,
  mockUpdatePlan,
  mockValidatePlanImportCsv
} from '../mocks/admin-plans'
import type {
  CreatePlanPayload,
  CreatePlanWithImportResponse,
  ImportSummary,
  OperatorOption,
  PlanDetail,
  PlanListParams,
  PlanListResponse,
  UpdatePlanPayload
} from '../types/plan'
import type { AnnotationListParams, AnnotationListResponse, ManualAnnotationDetail, ManualAnnotationListResponse, PlanStats } from '../types/report'

const useMockAdminApi = import.meta.env.VITE_ADMIN_API_MODE === 'mock'

function mockResponse<T>(data: T) {
  return { data }
}

export async function fetchPlans(params: PlanListParams) {
  if (useMockAdminApi) return mockResponse<PlanListResponse>(await mockFetchPlans(params))
  return api.get<PlanListResponse>('/admin/plans', { params })
}

export async function fetchPlan(planId: number) {
  if (useMockAdminApi) return mockResponse<PlanDetail>(await mockFetchPlan(planId))
  return api.get<PlanDetail>(`/admin/plans/${planId}`)
}

export async function createPlan(payload: CreatePlanPayload) {
  if (useMockAdminApi) return mockResponse<PlanDetail>((await mockCreatePlanWithImport(payload)).plan)
  return api.post<PlanDetail>('/admin/plans', payload)
}

export async function createPlanWithImport(payload: CreatePlanPayload, file: File) {
  if (useMockAdminApi) {
    void file
    return mockResponse<CreatePlanWithImportResponse>(await mockCreatePlanWithImport(payload))
  }
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('owner_user_id', String(payload.owner_user_id))
  formData.append('annotation_type', payload.annotation_type)
  if (payload.description) {
    formData.append('description', payload.description)
  }
  formData.append('file', file)
  return api.post<CreatePlanWithImportResponse>('/admin/plans/import-csv', formData)
}

export async function validatePlanImportCsv(payload: CreatePlanPayload, file: File) {
  if (useMockAdminApi) {
    return mockResponse<ImportSummary>(await mockValidatePlanImportCsv(payload, file))
  }
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('owner_user_id', String(payload.owner_user_id))
  formData.append('annotation_type', payload.annotation_type)
  if (payload.description) {
    formData.append('description', payload.description)
  }
  formData.append('file', file)
  return api.post<ImportSummary>('/admin/plans/import-csv/validate', formData)
}

export async function updatePlan(planId: number, payload: UpdatePlanPayload) {
  if (useMockAdminApi) return mockResponse<PlanDetail>(await mockUpdatePlan(planId, payload))
  return api.patch<PlanDetail>(`/admin/plans/${planId}`, payload)
}

export async function fetchOwners() {
  if (useMockAdminApi) return mockResponse<OperatorOption[]>(await mockFetchOwners())
  return api.get<OperatorOption[]>('/admin/plans/owners')
}

export async function importPlanCsv(planId: number, file: File) {
  if (useMockAdminApi) {
    void file
    return mockResponse<ImportSummary>(await mockImportPlanCsv(planId))
  }
  const formData = new FormData()
  formData.append('file', file)
  return api.post<ImportSummary>(`/admin/plans/${planId}/import-csv`, formData)
}

export async function fetchPlanStats(planId: number, params?: AnnotationListParams) {
  if (useMockAdminApi) {
    void params
    return mockResponse<PlanStats>(await mockFetchPlanStats(planId))
  }
  return api.get<PlanStats>(`/admin/plans/${planId}/stats`, { params })
}

export async function fetchPlanAnnotations(planId: number, params: AnnotationListParams) {
  if (useMockAdminApi) return mockResponse<AnnotationListResponse | ManualAnnotationListResponse>(await mockFetchPlanAnnotations(planId, params))
  return api.get<AnnotationListResponse | ManualAnnotationListResponse>(`/admin/plans/${planId}/annotations`, { params })
}

export async function fetchManualAnnotationDetail(planId: number, manualAnnotationId: number) {
  if (useMockAdminApi) {
    void planId
    return mockResponse<ManualAnnotationDetail>(await mockFetchManualAnnotationDetail(manualAnnotationId))
  }
  return api.get<ManualAnnotationDetail>(`/admin/plans/${planId}/annotations/${manualAnnotationId}`)
}
