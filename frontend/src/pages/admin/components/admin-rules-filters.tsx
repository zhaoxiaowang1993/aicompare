import type { SelectProps } from 'antd'
import Input from '../../../components/data-entry/input'
import Select from '../../../components/data-entry/select'
import Button from '../../../components/feedback/button'
import type { RuleCategory } from '../../../types/rules'
import { ruleCategoryOptions } from '../../../types/rules'

export interface AdminRulesFilterValue {
  keyword: string
  category?: RuleCategory
}

interface AdminRulesFiltersProps {
  value: AdminRulesFilterValue
  loading?: boolean
  onChange: (value: AdminRulesFilterValue) => void
  onSearch: () => void
  onReset: () => void
}

const categoryOptions: SelectProps['options'] = ruleCategoryOptions.map((item) => ({
  label: item.label,
  value: item.value
}))

export default function AdminRulesFilters({ value, loading, onChange, onSearch, onReset }: AdminRulesFiltersProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_220px_72px_72px]">
        <Input
          placeholder="按规则内容搜索"
          value={value.keyword}
          onChange={(event) => onChange({ ...value, keyword: event.target.value })}
          onPressEnter={onSearch}
        />
        <Select<RuleCategory | undefined>
          allowClear
          placeholder="全部规则类型"
          value={value.category}
          options={categoryOptions}
          className="[&_.ant-select-selection-placeholder]:!text-[var(--color-text-disabled)]"
          onChange={(category) => onChange({ ...value, category: category || undefined })}
        />
        <Button color="primary" variant="solid" loading={loading} onClick={onSearch}>
          查询
        </Button>
        <Button onClick={onReset}>重置</Button>
      </div>
    </div>
  )
}
