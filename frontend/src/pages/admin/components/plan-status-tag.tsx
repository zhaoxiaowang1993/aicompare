import Tag from '../../../components/data-display/tag'
import type { PlanDisplayStatus, PlanItem, PlanStatus } from '../../../types/plan'

export const planStatusText: Record<PlanDisplayStatus, string> = {
  active: '进行中',
  closed: '已关闭',
  completed: '已完成'
}

export function planDisplayStatus(plan: Pick<PlanItem, 'status' | 'total_cases' | 'annotated_cases'>): PlanDisplayStatus {
  if (plan.status === 'closed') return 'closed'
  if (plan.total_cases > 0 && plan.annotated_cases >= plan.total_cases) return 'completed'
  return 'active'
}

export default function PlanStatusTag({ status }: { status: PlanDisplayStatus | PlanStatus }) {
  const state = status === 'completed' ? 'success' : status === 'active' ? 'processing' : 'default'
  return (
    <Tag appearance="filled" state={state} className="font-normal">
      {planStatusText[status]}
    </Tag>
  )
}
