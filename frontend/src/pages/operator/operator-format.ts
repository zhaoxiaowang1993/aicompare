import type { OperatorAnnotationDecision, OperatorAnnotationReason, OperatorDocumentType, OperatorPlanStatus } from '../../types/operator'

export const documentTypeLabel: Record<OperatorDocumentType, string> = {
  admission_record_child: '入院病历-儿童',
  admission_record_female: '入院病历-女性',
  admission_record_male: '入院病历-男性',
  first_course_record: '首次病程记录',
  superior_physician_round: '上级医师查房记录',
  daily_course_record: '日常病程',
  discharge_record: '出院记录'
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
