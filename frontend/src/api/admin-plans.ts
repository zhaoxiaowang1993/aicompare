import api from '../lib/api'
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
import type { AnnotationListParams, AnnotationListResponse, PlanStats } from '../types/report'

export function fetchPlans(params: PlanListParams) {
  return api.get<PlanListResponse>('/admin/plans', { params })
}

export function fetchPlan(planId: number) {
  return api.get<PlanDetail>(`/admin/plans/${planId}`)
}

export function createPlan(payload: CreatePlanPayload) {
  return api.post<PlanDetail>('/admin/plans', payload)
}

export function createPlanWithImport(payload: CreatePlanPayload, file: File) {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('owner_user_id', String(payload.owner_user_id))
  if (payload.description) {
    formData.append('description', payload.description)
  }
  formData.append('file', file)
  return api.post<CreatePlanWithImportResponse>('/admin/plans/import-csv', formData)
}

export function updatePlan(planId: number, payload: UpdatePlanPayload) {
  return api.patch<PlanDetail>(`/admin/plans/${planId}`, payload)
}

export function fetchOwners() {
  return api.get<OperatorOption[]>('/admin/plans/owners')
}

export function importPlanCsv(planId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<ImportSummary>(`/admin/plans/${planId}/import-csv`, formData)
}

export function fetchPlanStats(planId: number, params?: AnnotationListParams) {
  return api.get<PlanStats>(`/admin/plans/${planId}/stats`, { params })
}

export function fetchPlanAnnotations(planId: number, params: AnnotationListParams) {
  return api.get<AnnotationListResponse>(`/admin/plans/${planId}/annotations`, { params })
}
