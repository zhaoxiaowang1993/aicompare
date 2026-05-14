import Tag from '../../../components/data-display/tag'
import type { OperatorPlanStatus } from '../../../types/operator'

export const operatorPlanStatusText: Record<OperatorPlanStatus, string> = {
  not_started: '未开始',
  active: '进行中',
  completed: '已完成',
  closed: '已关闭'
}

export default function OperatorStatusTag({ status }: { status: OperatorPlanStatus }) {
  const state = status === 'active' ? 'processing' : status === 'completed' ? 'success' : status === 'not_started' ? 'warning' : 'default'
  return (
    <Tag appearance="filled" state={state} className="font-normal">
      {operatorPlanStatusText[status]}
    </Tag>
  )
}
