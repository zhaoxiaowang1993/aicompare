import Form from '../../../components/data-entry/form'
import Input from '../../../components/data-entry/input'
import Button from '../../../components/feedback/button'
import { planDisplayStatus, planStatusText } from './plan-status-tag'
import type { PlanDetail, PlanStatus, UpdatePlanPayload } from '../../../types/plan'

type PlanSettingsSectionProps = {
  plan: PlanDetail
  saving: boolean
  onSave: (values: UpdatePlanPayload) => void
  onStatusChange: (status: PlanStatus) => void
}

type PlanSettingsFormValues = Pick<UpdatePlanPayload, 'name' | 'description'>

export default function PlanSettingsSection({ plan, saving, onSave, onStatusChange }: PlanSettingsSectionProps) {
  const closed = plan.status === 'closed'
  const displayStatus = planDisplayStatus(plan)

  return (
    <div className="flex flex-col gap-16">
      <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-24">
        <Form<PlanSettingsFormValues>
          itemLayout="vertical"
          initialValues={{ name: plan.name, description: plan.description }}
          key={`${plan.id}-${plan.updated_at ?? ''}`}
          onFinish={onSave}
        >
          <div className="mb-20 flex items-center justify-between">
            <div className="text-lg font-semibold">计划设置</div>
            <Button color="primary" variant="solid" htmlType="submit" loading={saving}>
              保存
            </Button>
          </div>
          <Form
            renderMode="item"
            label="计划名称"
            className="[&_.ant-form-item-label>label]:!font-medium"
            itemProps={{ name: 'name', rules: [{ required: true, message: '请输入计划名称' }] }}
          >
            <Input placeholder="请输入计划名称" />
          </Form>
          <Form renderMode="item" label="计划说明" className="[&_.ant-form-item-label>label]:!font-medium" itemProps={{ name: 'description' }}>
            <Input kind="textarea" placeholder="请输入计划说明" rows={4} />
          </Form>
        </Form>
        <div className="mt-16 flex w-[240px] flex-col gap-8">
          <div className="text-base font-medium text-[var(--color-text)]">状态</div>
          <div className="flex h-[32px] items-center rounded-md border border-[var(--color-border)] bg-[var(--color-fill-quaternary)] px-12 text-base font-normal text-[var(--color-text-secondary)]">
            {planStatusText[displayStatus]}
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-24">
        <div className="flex items-center justify-between gap-16">
          <div>
            <div className={`text-lg font-semibold ${closed ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
              {closed ? '重启计划' : '关闭计划'}
            </div>
            <div className="mt-4 text-base text-[var(--color-text-secondary)]">
              {closed ? '已关闭的计划可以重新启用，重启后状态恢复为进行中' : '关闭后计划状态将变为已关闭'}
            </div>
          </div>
          <Button color={closed ? 'primary' : 'danger'} variant={closed ? 'solid' : 'outlined'} onClick={() => onStatusChange(closed ? 'active' : 'closed')}>
            {closed ? '重启计划' : '关闭计划'}
          </Button>
        </div>
      </div>
    </div>
  )
}
