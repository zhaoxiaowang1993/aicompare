import type {
  QualityRule,
  RuleCategory,
  RuleCreatePayload,
  RuleImportRowError,
  RuleImportSummary,
  RuleListParams,
  RuleListResponse,
  RuleSummary,
  RuleUpdatePayload
} from '../types/rules'
import { ruleCategories, ruleCategoryOptions } from '../types/rules'

const initialRules: QualityRule[] = [
  {
    id: 1,
    category: 'admission_record',
    content: '入院记录应在患者入院后24小时内完成，主诉、现病史、既往史需完整记录。',
    score: '5分',
    created_by: 1,
    created_at: '2026-05-08T09:12:00Z',
    updated_at: '2026-05-08T09:12:00Z',
    deleted_at: null
  },
  {
    id: 2,
    category: 'first_course_record',
    content: '首次病程记录需包含初步诊断、诊断依据、鉴别诊断和诊疗计划。',
    score: '10分',
    created_by: 1,
    created_at: '2026-05-06T10:30:00Z',
    updated_at: '2026-05-06T10:30:00Z',
    deleted_at: null
  },
  {
    id: 3,
    category: 'superior_physician_round',
    content: '上级医师查房记录应体现病情分析、诊疗调整意见和上级医师签名。',
    score: '8分',
    created_by: 1,
    created_at: '2026-05-03T14:20:00Z',
    updated_at: '2026-05-03T14:20:00Z',
    deleted_at: null
  },
  {
    id: 4,
    category: 'daily_course_record',
    content: '日常病程需连续记录病情变化、检查结果分析及治疗反应。',
    score: '6分',
    created_by: 1,
    created_at: '2026-04-29T08:40:00Z',
    updated_at: '2026-04-29T08:40:00Z',
    deleted_at: null
  },
  {
    id: 5,
    category: 'discharge_record',
    content: '出院记录需包含入院诊断、出院诊断、治疗经过、出院医嘱和随访建议。',
    score: '10分',
    created_by: 1,
    created_at: '2026-04-28T11:05:00Z',
    updated_at: '2026-04-28T11:05:00Z',
    deleted_at: null
  },
  {
    id: 6,
    category: 'admission_record',
    content: '入院记录应在患者入院后24小时内完成，主诉、现病史、既往史需完整记录。',
    score: '5分',
    created_by: 1,
    created_at: '2026-04-27T09:00:00Z',
    updated_at: '2026-04-27T09:00:00Z',
    deleted_at: null
  },
  {
    id: 7,
    category: 'daily_course_record',
    content: '疑难或危重患者日常病程需及时记录病情变化、会诊意见和处理结果，文字较长时表格仍需保持完整展示。',
    score: '扣2分',
    created_by: 1,
    created_at: '2026-04-26T16:22:00Z',
    updated_at: '2026-04-26T16:22:00Z',
    deleted_at: null
  },
  {
    id: 8,
    category: 'discharge_record',
    content: '已软删除的出院记录规则不应出现在管理员列表中。',
    score: '3分',
    created_by: 1,
    created_at: '2026-04-20T12:00:00Z',
    updated_at: '2026-04-21T12:00:00Z',
    deleted_at: '2026-04-22T12:00:00Z'
  }
]

let rules = [...initialRules]
let nextId = 9
let latestImportedAt: string | null = '2026-05-08'

function delay<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms)
  })
}

function nowIso() {
  return new Date().toISOString()
}

function normalize(value: string | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function isRuleCategory(value: string): value is RuleCategory {
  return ruleCategories.includes(value as RuleCategory)
}

function categoryFromLabel(value: string): RuleCategory | null {
  const byValue = ruleCategoryOptions.find((item) => item.value === value)
  if (byValue) return byValue.value

  const byLabel = ruleCategoryOptions.find((item) => item.label === value)
  return byLabel?.value ?? null
}

function validatePayload(payload: RuleCreatePayload | RuleUpdatePayload) {
  if ('category' in payload && payload.category && !isRuleCategory(payload.category)) {
    throw new Error('RULE_CATEGORY_INVALID')
  }
}

function visibleRules() {
  return rules.filter((rule) => !rule.deleted_at)
}

export async function mockFetchRules(params: RuleListParams): Promise<RuleListResponse> {
  const keyword = normalize(params.keyword)
  let items = visibleRules()

  if (params.category) {
    items = items.filter((rule) => rule.category === params.category)
  }

  if (keyword) {
    items = items.filter((rule) => rule.content.toLowerCase().includes(keyword))
  }

  items = items.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  const start = (params.page - 1) * params.page_size

  return delay({
    items: items.slice(start, start + params.page_size),
    total: items.length,
    page: params.page,
    page_size: params.page_size
  })
}

export async function mockCreateRule(payload: RuleCreatePayload): Promise<QualityRule> {
  validatePayload(payload)
  const timestamp = nowIso()
  const rule: QualityRule = {
    id: nextId,
    category: payload.category,
    content: payload.content.trim(),
    score: payload.score.trim(),
    created_by: 1,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null
  }
  nextId += 1
  rules = [rule, ...rules]
  return delay(rule)
}

export async function mockUpdateRule(ruleId: number, payload: RuleUpdatePayload): Promise<QualityRule> {
  validatePayload(payload)
  const rule = rules.find((item) => item.id === ruleId && !item.deleted_at)
  if (!rule) {
    throw new Error('RULE_NOT_FOUND')
  }

  const updated: QualityRule = {
    ...rule,
    ...payload,
    content: payload.content?.trim() ?? rule.content,
    score: payload.score?.trim() ?? rule.score,
    updated_at: nowIso()
  }
  rules = rules.map((item) => (item.id === ruleId ? updated : item))
  return delay(updated)
}

export async function mockDeleteRule(ruleId: number): Promise<void> {
  const timestamp = nowIso()
  rules = rules.map((item) => (item.id === ruleId ? { ...item, deleted_at: timestamp, updated_at: timestamp } : item))
  await delay(undefined)
}

export async function mockDownloadRuleTemplate(): Promise<Blob> {
  const csv = '\uFEFF规则分类,规则内容,分值\n入院病历,入院记录应在患者入院后24小时内完成,5分\n'
  return delay(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 120)
}

export async function mockImportRules(file: File): Promise<RuleImportSummary> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const dataLines = lines[0]?.includes('规则分类') || lines[0]?.includes('category') ? lines.slice(1) : lines
  const errors: RuleImportRowError[] = []
  const imported: QualityRule[] = []

  dataLines.forEach((line, index) => {
    const rowNumber = index + 2
    const [categoryRaw = '', contentRaw = '', scoreRaw = ''] = line.split(',').map((item) => item.trim())
    const category = categoryFromLabel(categoryRaw)

    if (!categoryRaw) {
      errors.push({ row_number: rowNumber, field: 'category', reason: '规则分类缺项', raw_value: line })
      return
    }
    if (!category) {
      errors.push({ row_number: rowNumber, field: 'category', reason: '规则分类不在枚举范围内', raw_value: line })
      return
    }
    if (!contentRaw) {
      errors.push({ row_number: rowNumber, field: 'content', reason: '规则内容缺项', raw_value: line })
      return
    }
    if (!scoreRaw) {
      errors.push({ row_number: rowNumber, field: 'score', reason: '分值缺项', raw_value: line })
      return
    }

    const timestamp = nowIso()
    imported.push({
      id: nextId,
      category,
      content: contentRaw,
      score: scoreRaw,
      created_by: 1,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null
    })
    nextId += 1
  })

  if (file.name.includes('partial') && errors.length === 0) {
    errors.push(
      { row_number: 4, field: 'category', reason: '规则分类缺项', raw_value: '规则内容：病程记录应连续完整；分值：6分' },
      { row_number: 7, field: 'category', reason: '规则分类不在枚举范围内', raw_value: '规则分类：术前记录；规则内容：上级医师查房意见需记录' },
      { row_number: 12, field: 'content', reason: '规则内容缺项', raw_value: '规则分类：出院记录；分值：10分' }
    )
  }

  rules = [...imported, ...rules]
  if (imported.length > 0) {
    latestImportedAt = new Date().toISOString().slice(0, 10)
  }

  return delay({
    total_rows: dataLines.length || imported.length + errors.length,
    success_rows: imported.length,
    failed_rows: errors.length,
    errors
  })
}

export async function mockFetchRuleSummary(): Promise<RuleSummary> {
  const items = visibleRules()
  return delay(
    {
      total_rules: items.length,
      category_count: new Set(items.map((item) => item.category)).size,
      latest_imported_at: latestImportedAt
    },
    120
  )
}
