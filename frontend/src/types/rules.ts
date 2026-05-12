export const ruleCategories = [
  'admission_record',
  'first_course_record',
  'superior_physician_round',
  'daily_course_record',
  'discharge_record'
] as const

export type RuleCategory = (typeof ruleCategories)[number]

export type RuleCategoryOption = {
  value: RuleCategory
  label: string
}

export const ruleCategoryOptions: RuleCategoryOption[] = [
  { value: 'admission_record', label: '入院病历' },
  { value: 'first_course_record', label: '首次病程记录' },
  { value: 'superior_physician_round', label: '上级医师查房记录' },
  { value: 'daily_course_record', label: '日常病程' },
  { value: 'discharge_record', label: '出院记录' }
]

export interface QualityRule {
  id: number
  category: RuleCategory
  content: string
  score: string
  created_by?: number | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface RuleListParams {
  keyword?: string
  category?: RuleCategory
  page: number
  page_size: number
}

export interface RuleListResponse {
  items: QualityRule[]
  total: number
  page: number
  page_size: number
}

export interface RuleCreatePayload {
  category: RuleCategory
  content: string
  score: string
}

export type RuleUpdatePayload = Partial<RuleCreatePayload>

export interface RuleImportRowError {
  row_number: number
  field: 'category' | 'content' | 'score' | 'row'
  reason: string
  raw_value?: string | null
}

export interface RuleImportSummary {
  total_rows: number
  success_rows: number
  failed_rows: number
  errors: RuleImportRowError[]
}

export interface RuleSummary {
  total_rules: number
  category_count: number
  latest_imported_at?: string | null
}
