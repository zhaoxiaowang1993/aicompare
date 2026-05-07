import type { SelectProps } from 'antd'
import Input from '../../../components/data-entry/input'
import Select from '../../../components/data-entry/select'
import Button from '../../../components/feedback/button'
import type { OperatorOption, PlanStatus } from '../../../types/plan'

export type PlanListFilterValue = {
  keyword: string
  status?: PlanStatus
  ownerUserId?: number
}

type PlanListFiltersProps = {
  value: PlanListFilterValue
  owners: OperatorOption[]
  loading?: boolean
  onChange: (value: PlanListFilterValue) => void
  onSearch: () => void
  onReset: () => void
}

const statusOptions: SelectProps['options'] = [
  { label: '进行中', value: 'active' },
  { label: '已关闭', value: 'closed' }
]

export default function PlanListFilters({ value, owners, loading, onChange, onSearch, onReset }: PlanListFiltersProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_180px_180px_72px_72px]">
        <Input
          placeholder="按计划名称搜索"
          value={value.keyword}
          onChange={(event) => onChange({ ...value, keyword: event.target.value })}
        />
        <Select<PlanStatus | undefined>
          allowClear
          placeholder="全部状态"
          value={value.status}
          options={statusOptions}
          className="[&_.ant-select-selection-placeholder]:!text-[var(--color-text-disabled)]"
          onChange={(status) => onChange({ ...value, status: status || undefined })}
        />
        <Select<number | undefined>
          allowClear
          placeholder="全部负责人"
          value={value.ownerUserId}
          options={owners.map((owner) => ({ label: owner.username, value: owner.id }))}
          className="[&_.ant-select-selection-placeholder]:!text-[var(--color-text-disabled)]"
          onChange={(ownerUserId) => onChange({ ...value, ownerUserId })}
        />
        <Button color="primary" variant="solid" loading={loading} onClick={onSearch}>
          查询
        </Button>
        <Button onClick={onReset}>重置</Button>
      </div>
    </div>
  )
}
