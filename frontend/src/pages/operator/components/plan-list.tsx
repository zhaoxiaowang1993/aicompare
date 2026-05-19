import { CalendarOutlined } from '@ant-design/icons'
import { Progress } from 'antd'
import Button from '../../../components/feedback/button'
import Card from '../../../components/data-display/card'
import type { OperatorPlanListItem } from '../../../types/operator'
import OperatorStatusTag from './operator-status-tag'
import OperatorPlanTypeTag from './operator-plan-type-tag'

type PlanListProps = {
  items: OperatorPlanListItem[]
  onStart: (plan: OperatorPlanListItem) => void
}

function actionText(plan: OperatorPlanListItem) {
  if (plan.status === 'closed') return '已关闭'
  if (plan.status === 'completed') return '已完成'
  return '开始标注'
}

function formatUpdatedAt(value: string | null | undefined) {
  if (!value) return '-'
  const normalized = value.replace('T', ' ').replace(/\.\d+/, '')
  return normalized.length === 16 ? `${normalized}:00` : normalized.slice(0, 19)
}

export default function PlanList({ items, onStart }: PlanListProps) {
  return (
    <Card className="[&_.ant-card-body]:p-0">
      <div className="border-b border-border-secondary px-24 py-16">
        <div className="grid grid-cols-[minmax(320px,1fr)_128px_160px_180px_128px] items-center gap-16 text-sm text-text-secondary">
          <span>计划名称</span>
          <span>标注模式</span>
          <span>状态</span>
          <span>完成进度</span>
          <span className="text-right">操作</span>
        </div>
      </div>
      <div className="divide-y divide-border-secondary">
        {items.map((plan) => {
          const disabled = plan.status === 'closed' || plan.status === 'completed'
          return (
            <div key={plan.id} className="grid grid-cols-[minmax(320px,1fr)_128px_160px_180px_128px] items-center gap-16 px-24 py-20">
              <div className="min-w-0">
                <h2 className="m-0 truncate text-lg font-medium leading-lg text-text">{plan.name}</h2>
                <p className="m-0 mt-6 line-clamp-1 text-base text-text-secondary">{plan.description ?? '暂无计划说明'}</p>
                <div className="mt-10 flex items-center gap-8 text-sm text-text-tertiary">
                  <CalendarOutlined aria-hidden="true" />
                  <span>更新于 {formatUpdatedAt(plan.updated_at)}</span>
                </div>
              </div>
              <div>
                <OperatorPlanTypeTag type={plan.annotation_type} />
              </div>
              <div>
                <OperatorStatusTag status={plan.status} />
              </div>
              <div className="min-w-0">
                <div className="mb-6 flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    {plan.annotated_cases}/{plan.total_cases}
                  </span>
                  <span className="font-medium text-text">{plan.completion_rate}%</span>
                </div>
                <Progress
                  percent={plan.completion_rate}
                  showInfo={false}
                  strokeColor="var(--color-primary)"
                  trailColor="var(--color-fill-quaternary)"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  color={disabled ? 'default' : 'primary'}
                  variant={disabled ? 'outlined' : 'solid'}
                  disabled={disabled}
                  onClick={() => onStart(plan)}
                >
                  {actionText(plan)}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
