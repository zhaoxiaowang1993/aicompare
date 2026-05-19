import type {
  CreatePlanPayload,
  CreatePlanWithImportResponse,
  ImportSummary,
  OperatorOption,
  PlanAnnotationType,
  PlanDetail,
  PlanItem,
  PlanListParams,
  PlanListResponse,
  UpdatePlanPayload
} from '../types/plan'
import type {
  AnnotationDetail,
  AnnotationListParams,
  AnnotationListResponse,
  ManualAnnotationDetail,
  ManualAnnotationListResponse,
  ManualCaseAnnotationSummary,
  PlanStats
} from '../types/report'

const delayMs = 220

const owners: OperatorOption[] = [
  { id: 2, username: 'czy' },
  { id: 3, username: 'lxy' },
  { id: 4, username: '张医生' },
  { id: 5, username: '李医生' },
  { id: 6, username: '王医生' }
]

const plans: PlanDetail[] = [
  {
    id: 201,
    name: '心内科出院小结 A/B 评测',
    description: '对比两个智能体在出院小结质控中的输出质量',
    annotation_type: 'comparison',
    status: 'active',
    owner_user_id: 4,
    owner_username: '张医生',
    total_cases: 200,
    annotated_cases: 180,
    pending_cases: 20,
    completion_rate: 0.9,
    created_at: '2026-04-18T08:40:00Z',
    updated_at: '2026-04-22T10:20:00Z'
  },
  {
    id: 202,
    name: '内科病历手动质控标注',
    description: '手动标注病历原文中的质控问题与修改建议',
    annotation_type: 'manual',
    status: 'active',
    owner_user_id: 2,
    owner_username: 'czy',
    total_cases: 160,
    annotated_cases: 128,
    pending_cases: 32,
    completion_rate: 0.8,
    created_at: '2026-04-20T09:00:00Z',
    updated_at: '2026-04-22T10:25:00Z'
  },
  {
    id: 203,
    name: '神经内科复诊文本偏好标注',
    description: '手动标注复诊文书中的质控建议',
    annotation_type: 'manual',
    status: 'closed',
    owner_user_id: 6,
    owner_username: '王医生',
    total_cases: 96,
    annotated_cases: 96,
    pending_cases: 0,
    completion_rate: 1,
    created_at: '2026-04-12T08:30:00Z',
    updated_at: '2026-04-21T17:10:00Z'
  }
]

const manualRecordText =
  '主诉：反复胸痛 3 小时。\n\n' +
  '现病史：患者入院前突发胸骨后压榨样疼痛，伴出汗，无明显呼吸困难。既往高血压病史 10 年。\n\n' +
  '患者入院后未及时完善入院记录\n\n' +
  '查体：血压 152/92mmHg，心率 86 次/分。\n\n' +
  '初步诊断：急性冠脉综合征待排。\n' +
  '未见心电图完成时间记录\n' +
  '未见肌钙蛋白复查计划'

function offsetOf(sourceText: string) {
  const start = manualRecordText.indexOf(sourceText)
  return { start_offset: start, end_offset: start + sourceText.length }
}

const manualSummaries: ManualCaseAnnotationSummary[] = [
  {
    manual_annotation_id: 701,
    case_id: 9001,
    hospitalization_no: 'ZY20260001',
    operator_user_id: 2,
    operator_username: 'czy',
    result: 'has_issues',
    problem_count: 3,
    submitted_at: '2026-04-22T10:25:00Z'
  },
  {
    manual_annotation_id: 702,
    case_id: 9002,
    hospitalization_no: 'ZY20260002',
    operator_user_id: 2,
    operator_username: 'czy',
    result: 'no_issue',
    problem_count: 0,
    submitted_at: '2026-04-22T10:31:00Z'
  },
  {
    manual_annotation_id: 703,
    case_id: 9003,
    hospitalization_no: 'ZY20260003',
    operator_user_id: 3,
    operator_username: 'lxy',
    result: 'has_issues',
    problem_count: 2,
    submitted_at: '2026-04-22T10:42:00Z'
  },
  {
    manual_annotation_id: 704,
    case_id: 9004,
    hospitalization_no: 'ZY20260004',
    operator_user_id: 3,
    operator_username: 'lxy',
    result: 'has_issues',
    problem_count: 1,
    submitted_at: '2026-04-22T11:08:00Z'
  }
]

const manualDetail: ManualAnnotationDetail = {
  manual_annotation_id: 701,
  case_id: 9001,
  hospitalization_no: 'ZY20260001',
  operator: 'czy',
  result: 'has_issues',
  record_text: manualRecordText,
  submitted_at: '2026-04-22T10:25:00Z',
  entries: [
    {
      entry_id: 90001,
      source_text: '患者入院后未及时完善入院记录',
      ...offsetOf('患者入院后未及时完善入院记录'),
      quality_rule: {
        id: 11,
        category: '入院病历',
        content: '入院记录应在患者入院后24小时内完成',
        score: '5分'
      },
      suggestion: '补充入院记录完成时间及相关病程描述',
      notes: '需核对实际入院时间',
      created_at: '2026-04-22T10:21:00Z'
    },
    {
      entry_id: 90002,
      source_text: '未见心电图完成时间记录',
      ...offsetOf('未见心电图完成时间记录'),
      quality_rule: {
        id: 12,
        category: '首次病程',
        content: '首次病程记录需包含关键检查完成情况',
        score: '3分'
      },
      suggestion: '补充心电图检查时间与结果摘要',
      notes: null,
      created_at: '2026-04-22T10:23:00Z'
    },
    {
      entry_id: 90003,
      source_text: '未见肌钙蛋白复查计划',
      ...offsetOf('未见肌钙蛋白复查计划'),
      quality_rule: {
        id: 13,
        category: '急性胸痛',
        content: '急性胸痛需记录动态复查计划',
        score: '4分'
      },
      suggestion: '补充肌钙蛋白复查时间点',
      notes: null,
      created_at: '2026-04-22T10:24:00Z'
    }
  ]
}

const comparisonAnnotations: AnnotationDetail[] = [
  {
    id: 801,
    case_id: 8801,
    hospitalization_no: 'ZY20259901',
    operator_user_id: 4,
    operator_username: '张医生',
    decision: 'A_BETTER',
    reason_codes: ['NO_HIT_ERROR_RULE'],
    notes: 'A 结果命中更准确',
    record_text: '患者出院记录示例文本。',
    agent_a_output: 'A 输出更完整。',
    agent_b_output: 'B 输出存在遗漏。',
    display_a_source: '智能体 A',
    display_b_source: '智能体 B',
    created_at: '2026-04-22T10:18:00Z'
  }
]

function wait() {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function paginate<T>(items: T[], page = 1, pageSize = 10) {
  return items.slice((page - 1) * pageSize, page * pageSize)
}

function ownerName(ownerId: number) {
  return owners.find((owner) => owner.id === ownerId)?.username ?? null
}

function asItem(plan: PlanDetail): PlanItem {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    annotation_type: plan.annotation_type,
    status: plan.status,
    owner_user_id: plan.owner_user_id,
    owner_username: plan.owner_username,
    total_cases: plan.total_cases,
    annotated_cases: plan.annotated_cases
  }
}

function filterByType(items: PlanDetail[], annotationType?: PlanAnnotationType) {
  return annotationType ? items.filter((plan) => plan.annotation_type === annotationType) : items
}

export async function mockFetchPlans(params: PlanListParams): Promise<PlanListResponse> {
  await wait()
  const filtered = filterByType(plans, params.annotation_type).filter((plan) => {
    return (!params.status || plan.status === params.status) && (!params.owner_user_id || plan.owner_user_id === params.owner_user_id)
  })
  return {
    items: clone(paginate(filtered.map(asItem), params.page, params.page_size)),
    total: filtered.length,
    page: params.page,
    page_size: params.page_size
  }
}

export async function mockFetchPlan(planId: number): Promise<PlanDetail> {
  await wait()
  const plan = plans.find((item) => item.id === planId) ?? plans[1]
  return clone(plan)
}

export async function mockFetchOwners(): Promise<OperatorOption[]> {
  await wait()
  return clone(owners)
}

export async function mockCreatePlanWithImport(payload: CreatePlanPayload): Promise<CreatePlanWithImportResponse> {
  await wait()
  const nextId = Math.max(...plans.map((plan) => plan.id)) + 1
  const plan: PlanDetail = {
    id: nextId,
    name: payload.name,
    description: payload.description,
    annotation_type: payload.annotation_type,
    status: 'active',
    owner_user_id: payload.owner_user_id,
    owner_username: ownerName(payload.owner_user_id),
    total_cases: payload.annotation_type === 'manual' ? 80 : 120,
    annotated_cases: 0,
    pending_cases: payload.annotation_type === 'manual' ? 80 : 120,
    completion_rate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  plans.unshift(plan)
  return {
    plan: clone(plan),
    import_summary: {
      plan_id: nextId,
      import_batch_id: `mock_${Date.now()}`,
      total_rows: plan.total_cases,
      success_rows: plan.total_cases,
      skipped_rows: 0,
      failed_rows: 0,
      errors: []
    }
  }
}

export async function mockImportPlanCsv(planId: number): Promise<ImportSummary> {
  await wait()
  const plan = plans.find((item) => item.id === planId)
  const rows = plan?.annotation_type === 'manual' ? 80 : 120
  return {
    plan_id: planId,
    import_batch_id: `mock_${Date.now()}`,
    total_rows: rows,
    success_rows: rows,
    skipped_rows: 0,
    failed_rows: 0,
    errors: []
  }
}

export async function mockUpdatePlan(planId: number, payload: UpdatePlanPayload): Promise<PlanDetail> {
  await wait()
  const index = plans.findIndex((plan) => plan.id === planId)
  if (index >= 0) {
    plans[index] = {
      ...plans[index],
      ...payload,
      owner_username: payload.owner_user_id ? ownerName(payload.owner_user_id) : plans[index].owner_username,
      updated_at: new Date().toISOString()
    }
  }
  return clone(plans[index] ?? plans[0])
}

export async function mockFetchPlanStats(planId: number): Promise<PlanStats> {
  await wait()
  const plan = plans.find((item) => item.id === planId) ?? plans[1]
  if (plan.annotation_type === 'manual') {
    return {
      plan_id: plan.id,
      annotation_type: 'manual',
      total_cases: plan.total_cases,
      annotated_cases: plan.annotated_cases,
      pending_cases: plan.pending_cases,
      completion_rate: plan.completion_rate,
      has_issues_cases: 91,
      no_issue_cases: 37
    }
  }
  return {
    plan_id: plan.id,
    annotation_type: 'comparison',
    total_cases: plan.total_cases,
    annotated_cases: plan.annotated_cases,
    pending_cases: plan.pending_cases,
    completion_rate: plan.completion_rate,
    decision_distribution: {
      A_BETTER: 86,
      B_BETTER: 42,
      BOTH_BAD: 18,
      BOTH_GOOD: 34
    },
    reason_distribution: [
      { key: 'NO_HIT_ERROR_RULE', count: 88 },
      { key: 'NO_MISSING_RULE', count: 49 }
    ]
  }
}

export async function mockFetchPlanAnnotations(planId: number, params: AnnotationListParams): Promise<AnnotationListResponse | ManualAnnotationListResponse> {
  await wait()
  const plan = plans.find((item) => item.id === planId) ?? plans[1]
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 10
  if (plan.annotation_type === 'manual') {
    const filtered = manualSummaries.filter((item) => {
      return (!params.operator_user_id || item.operator_user_id === params.operator_user_id) && (!params.result || item.result === params.result)
    })
    return {
      items: clone(paginate(filtered, page, pageSize)),
      total: filtered.length,
      page,
      page_size: pageSize
    }
  }
  return {
    items: clone(paginate(comparisonAnnotations, page, pageSize)),
    total: comparisonAnnotations.length,
    page,
    page_size: pageSize
  }
}

export async function mockFetchManualAnnotationDetail(manualAnnotationId: number): Promise<ManualAnnotationDetail> {
  await wait()
  if (manualAnnotationId === 702) {
    return {
      ...manualDetail,
      manual_annotation_id: 702,
      case_id: 9002,
      hospitalization_no: 'ZY20260002',
      result: 'no_issue',
      submitted_at: '2026-04-22T10:31:00Z',
      entries: []
    }
  }
  return clone(manualDetail)
}
