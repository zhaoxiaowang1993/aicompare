import api from '../lib/api'
import {
  mockFetchOperatorNextTask,
  mockFetchOperatorPlans,
  mockSubmitOperatorAnnotation
} from '../mocks/operator'
import type {
  OperatorAnnotationPayload,
  OperatorAnnotationResult,
  OperatorDocumentType,
  OperatorPlanListParams,
  OperatorPlanListItem,
  OperatorPlanListResponse,
  OperatorQualityRule,
  OperatorTask,
  OperatorTaskResponse
} from '../types/operator'

const useMockOperatorApi = import.meta.env.VITE_OPERATOR_API_MODE === 'mock'

type BackendPlanStatus = 'active' | 'closed'

type BackendOperatorPlan = {
  id: number
  name: string
  description?: string | null
  status: BackendPlanStatus
  total_cases: number
  annotated_cases: number
  pending_cases: number
  completion_rate: number
  updated_at?: string | null
}

type BackendPlanListResponse = {
  items: BackendOperatorPlan[]
  total: number
  page: number
  page_size: number
}

type BackendQualityRule = {
  id: number
  category: string
  content: string
  score: string
}

type BackendTaskPayload = {
  case_id: number
  plan_id: number
  hospitalization_no: string
  record_text: string
  output_a: string
  output_b: string
  display_mapping: {
    A: 'agent_a' | 'agent_b'
    B: 'agent_a' | 'agent_b'
  }
  quality_rules: BackendQualityRule[]
}

const documentTypes: OperatorDocumentType[] = ['admission', 'first_course', 'superior_round', 'daily_course', 'discharge']

const ruleCategoryMap: Record<string, OperatorDocumentType> = {
  admission_record: 'admission',
  first_course_record: 'first_course',
  superior_physician_round: 'superior_round',
  daily_course_record: 'daily_course',
  discharge_record: 'discharge'
}

function toPercent(value: number) {
  return value <= 1 ? Math.round(value * 100) : Math.round(value)
}

function formatBackendDateTime(value: string | null | undefined) {
  if (!value) return value
  return value.replace('T', ' ').replace(/\.\d+/, '').slice(0, 19)
}

function mapPlan(plan: BackendOperatorPlan): OperatorPlanListItem {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    status: plan.status === 'closed' ? 'closed' : plan.pending_cases === 0 && plan.total_cases > 0 ? 'completed' : plan.annotated_cases === 0 ? 'not_started' : 'active',
    total_cases: plan.total_cases,
    annotated_cases: plan.annotated_cases,
    pending_cases: plan.pending_cases,
    completion_rate: toPercent(plan.completion_rate),
    updated_at: formatBackendDateTime(plan.updated_at)
  }
}

function emptyQualityRules(): Record<OperatorDocumentType, OperatorQualityRule[]> {
  return documentTypes.reduce(
    (rules, type) => {
      rules[type] = []
      return rules
    },
    {} as Record<OperatorDocumentType, OperatorQualityRule[]>
  )
}

function mapQualityRules(rules: BackendQualityRule[]) {
  return rules.reduce((grouped, rule) => {
    const type = ruleCategoryMap[rule.category] ?? 'admission'
    grouped[type].push({
      id: String(rule.id),
      code: rule.category,
      title: rule.content,
      description: rule.content,
      score: rule.score
    })
    return grouped
  }, emptyQualityRules())
}

function mapTask(task: BackendTaskPayload, plan: OperatorPlanListItem): OperatorTask {
  return {
    id: task.case_id,
    sequence_no: Math.min(plan.annotated_cases + 1, plan.total_cases || 1),
    total_tasks: plan.total_cases,
    case_data: {
      id: task.case_id,
      hospitalization_no: task.hospitalization_no,
      patient_name: '-',
      gender: '-',
      age: 0,
      department: '-',
      admission_time: '-',
      discharge_time: null,
      documents: [
        {
          id: `case-${task.case_id}-record`,
          type: 'admission',
          title: '病历原文',
          content: task.record_text
        }
      ]
    },
    outputs: [
      {
        side: 'A',
        name: '结果 A',
        conclusion: task.output_a,
        summary: task.display_mapping.A,
        rules: []
      },
      {
        side: 'B',
        name: '结果 B',
        conclusion: task.output_b,
        summary: task.display_mapping.B,
        rules: []
      }
    ],
    quality_rules: mapQualityRules(task.quality_rules)
  }
}

async function fetchBackendPlans(params: OperatorPlanListParams = {}) {
  const response = await api.get<BackendPlanListResponse>('/operator/plans', { params })
  return response.data
}

async function fetchAssignedPlan(planId: number) {
  const pageSize = 100
  let page = 1
  while (true) {
    const response = await fetchBackendPlans({ page, page_size: pageSize })
    const plan = response.items.find((item) => item.id === planId)
    if (plan) return mapPlan(plan)
    if (page * pageSize >= response.total) return null
    page += 1
  }
}

export async function fetchOperatorPlans(params: OperatorPlanListParams = {}) {
  if (useMockOperatorApi) {
    return mockFetchOperatorPlans(params)
  }
  const response = await fetchBackendPlans(params)
  return {
    ...response,
    items: response.items.map(mapPlan)
  } satisfies OperatorPlanListResponse
}

export async function fetchOperatorNextTask(planId: number) {
  if (useMockOperatorApi) {
    return mockFetchOperatorNextTask(planId)
  }
  const plan = await fetchAssignedPlan(planId)
  if (plan?.status === 'closed') {
    return { plan, task: null } satisfies OperatorTaskResponse
  }

  const response = await api.get<BackendTaskPayload | null>(`/operator/plans/${planId}/tasks/next`)
  if (!plan) {
    throw new Error('operator plan is not visible to current user')
  }
  return {
    plan,
    task: response.data ? mapTask(response.data, plan) : null
  } satisfies OperatorTaskResponse
}

export async function submitOperatorAnnotation(planId: number, taskId: number, payload: OperatorAnnotationPayload) {
  if (useMockOperatorApi) {
    return mockSubmitOperatorAnnotation(planId, taskId, payload)
  }
  await api.post(`/operator/tasks/${taskId}/annotate`, payload)
  const next = await fetchOperatorNextTask(planId)
  return {
    completed: !next.task,
    next_task: next.task,
    plan: next.plan
  } satisfies OperatorAnnotationResult
}
