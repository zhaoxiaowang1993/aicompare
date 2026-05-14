export type OperatorPlanStatus = 'not_started' | 'active' | 'completed' | 'closed'

export type OperatorPlanListParams = {
  page?: number
  page_size?: number
}

export type OperatorPlanListItem = {
  id: number
  name: string
  description?: string | null
  status: OperatorPlanStatus
  total_cases: number
  annotated_cases: number
  pending_cases: number
  completion_rate: number
  updated_at?: string | null
}

export type OperatorPlanListResponse = {
  items: OperatorPlanListItem[]
  total: number
  page: number
  page_size: number
}

export type OperatorDocumentType =
  | 'admission'
  | 'first_course'
  | 'superior_round'
  | 'daily_course'
  | 'discharge'

export type OperatorDocument = {
  id: string
  type: OperatorDocumentType
  title: string
  content: string
}

export type OperatorCaseData = {
  id: number
  hospitalization_no: string
  patient_name: string
  gender: string
  age: number
  department: string
  admission_time: string
  discharge_time?: string | null
  documents: OperatorDocument[]
}

export type OperatorOutputSide = 'A' | 'B'

export type OperatorOutputRule = {
  id: string
  title: string
  evidence: string
  score: number
  severity: 'low' | 'medium' | 'high'
}

export type OperatorModelOutput = {
  side: OperatorOutputSide
  name: string
  conclusion: string
  summary: string
  rules: OperatorOutputRule[]
}

export type OperatorQualityRule = {
  id: string
  code: string
  title: string
  description: string
  score: string
}

export type OperatorTask = {
  id: number
  sequence_no: number
  total_tasks: number
  case_data: OperatorCaseData
  outputs: [OperatorModelOutput, OperatorModelOutput]
  quality_rules: Record<OperatorDocumentType, OperatorQualityRule[]>
}

export type OperatorTaskResponse = {
  plan: OperatorPlanListItem
  task: OperatorTask | null
}

export type OperatorAnnotationDecision = 'A_BETTER' | 'B_BETTER' | 'BOTH_GOOD' | 'BOTH_BAD'
export type OperatorAnnotationReason = 'NO_HIT_ERROR_RULE' | 'NO_MISSING_RULE' | 'NO_OVER_QC' | 'OTHER'

export type OperatorAnnotationPayload = {
  decision: OperatorAnnotationDecision
  reason_codes: OperatorAnnotationReason[]
  other_reason_text?: string | null
  notes?: string | null
}

export type OperatorAnnotationResult = {
  completed: boolean
  next_task: OperatorTask | null
  plan: OperatorPlanListItem
}
