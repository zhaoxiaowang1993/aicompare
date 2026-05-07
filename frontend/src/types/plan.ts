export type PlanStatus = 'active' | 'closed'
export type PlanDisplayStatus = PlanStatus | 'completed'

export type PlanListParams = {
  status?: PlanStatus
  owner_user_id?: number
  page: number
  page_size: number
}

export type PlanItem = {
  id: number
  name: string
  description?: string | null
  status: PlanStatus
  owner_user_id: number
  owner_username?: string | null
  total_cases: number
  annotated_cases: number
}

export type PlanDetail = PlanItem & {
  pending_cases: number
  completion_rate: number
  created_at: string
  updated_at?: string | null
}

export type PlanListResponse = {
  items: PlanItem[]
  total: number
  page: number
  page_size: number
}

export type OperatorOption = {
  id: number
  username: string
}

export type CreatePlanPayload = {
  name: string
  description?: string | null
  owner_user_id: number
}

export type UpdatePlanPayload = Partial<CreatePlanPayload> & {
  status?: PlanStatus
}

export type ImportErrorItem = {
  row_number: number
  hospitalization_no?: string | null
  reason: string
}

export type ImportSummary = {
  plan_id: number
  import_batch_id: string
  total_rows: number
  success_rows: number
  skipped_rows: number
  failed_rows: number
  errors: ImportErrorItem[]
}

export type CreatePlanWithImportResponse = {
  plan: PlanDetail
  import_summary: ImportSummary
}

export type PlanSummary = {
  activePlans: number
  totalCases: number
  annotatedCases: number
  completionRate: number
}
