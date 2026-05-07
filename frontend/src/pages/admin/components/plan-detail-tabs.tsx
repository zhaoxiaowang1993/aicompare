import Button from '../../../components/feedback/button'

export type PlanDetailTabKey = 'overview' | 'annotations' | 'settings'

type PlanDetailTabsProps = {
  activeKey: PlanDetailTabKey
  onChange: (key: PlanDetailTabKey) => void
}

const tabs: Array<{ key: PlanDetailTabKey; label: string }> = [
  { key: 'overview', label: '统计概览' },
  { key: 'annotations', label: '标注明细' },
  { key: 'settings', label: '设置' }
]

export default function PlanDetailTabs({ activeKey, onChange }: PlanDetailTabsProps) {
  return (
    <div className="flex items-center gap-8">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={activeKey === tab.key ? 'solid' : 'text'}
          color={activeKey === tab.key ? 'primary' : 'default'}
          className="text-base font-normal"
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
