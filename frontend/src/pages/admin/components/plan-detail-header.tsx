import { Link } from 'react-router-dom'
import PlanDetailTabs, { type PlanDetailTabKey } from './plan-detail-tabs'
import PlanStatusTag, { planDisplayStatus } from './plan-status-tag'
import type { PlanDetail } from '../../../types/plan'

type PlanDetailHeaderProps = {
  plan: PlanDetail | null
  activeTab: PlanDetailTabKey
  onTabChange: (key: PlanDetailTabKey) => void
}

function progress(plan: PlanDetail | null) {
  if (!plan) return '-'
  return `${plan.annotated_cases}/${plan.total_cases}，${Math.round(plan.completion_rate * 100)}%`
}

export default function PlanDetailHeader({ plan, activeTab, onTabChange }: PlanDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-12">
      <div className="text-caption font-normal text-[var(--color-text-secondary)]">
        <Link to="/admin/plans" className="font-normal text-[var(--color-primary)]">
          标注计划
        </Link>
        <span className="mx-8 text-[var(--color-text-secondary)]">/</span>
        <span>计划详情</span>
      </div>
      <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-12">
            <h1 className="m-0 text-heading-3 font-semibold leading-heading-3">{plan?.name ?? '计划详情'}</h1>
            {plan ? <PlanStatusTag status={planDisplayStatus(plan)} /> : null}
          </div>
          <div className="mt-4 text-base text-[var(--color-text-secondary)]">{progress(plan)}</div>
        </div>
        <PlanDetailTabs activeKey={activeTab} onChange={onTabChange} />
      </div>
    </div>
  )
}
