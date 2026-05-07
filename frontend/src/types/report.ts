export type Decision = 'A_BETTER' | 'B_BETTER' | 'BOTH_BAD' | 'BOTH_GOOD'

export type DistributionItem = {
  key: string
  count: number
}

export type AnnotationListParams = {
  operator_user_id?: number
  decision?: Decision
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export type PlanStats = {
  plan_id: number
  total_cases: number
  annotated_cases: number
  pending_cases: number
  completion_rate: number
  decision_distribution: Record<Decision, number>
  reason_distribution: DistributionItem[]
}

export type AnnotationDetail = {
  id: number
  case_id: number
  hospitalization_no: string
  operator_user_id: number
  operator_username?: string | null
  decision: Decision
  reason_codes: string[]
  other_reason_text?: string | null
  notes?: string | null
  record_text: string
  agent_a_output: string
  agent_b_output: string
  display_a_source: string
  display_b_source: string
  created_at: string
}

export type AnnotationListResponse = {
  items: AnnotationDetail[]
  total: number
  page: number
  page_size: number
}
