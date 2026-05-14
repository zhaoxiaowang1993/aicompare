import type { OperatorAnnotationDecision, OperatorAnnotationReason, OperatorDocumentType, OperatorPlanStatus } from '../../types/operator'

export const documentTypeLabel: Record<OperatorDocumentType, string> = {
  admission: '入院病历',
  first_course: '首次病程',
  superior_round: '上级查房',
  daily_course: '日常病程',
  discharge: '出院记录'
}

export const decisionLabel: Record<OperatorAnnotationDecision, string> = {
  A_BETTER: 'A 更好',
  B_BETTER: 'B 更好',
  BOTH_GOOD: '一样好',
  BOTH_BAD: '都不好'
}

export const reasonLabel: Record<OperatorAnnotationReason, string> = {
  NO_HIT_ERROR_RULE: '无命中错误规则',
  NO_MISSING_RULE: '无遗漏规则',
  NO_OVER_QC: '无过度质控',
  OTHER: '其他'
}

export const planStatusLabel: Record<OperatorPlanStatus, string> = {
  not_started: '未开始',
  active: '进行中',
  completed: '已完成',
  closed: '已关闭'
}
