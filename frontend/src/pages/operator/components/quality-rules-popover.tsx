import { Popover } from 'antd'
import type { ReactNode } from 'react'
import Empty from '../../../components/data-display/empty'
import Button from '../../../components/feedback/button'
import Tabs from '../../../components/navigation/tabs'
import type { OperatorDocumentType, OperatorQualityRule } from '../../../types/operator'
import { documentTypeLabel } from '../operator-format'

type QualityRulesPopoverProps = {
  rules: Record<OperatorDocumentType, OperatorQualityRule[]>
  children?: ReactNode
}

const documentTypes: OperatorDocumentType[] = [
  'admission_record_child',
  'admission_record_female',
  'admission_record_male',
  'first_course_record',
  'superior_physician_round',
  'daily_course_record',
  'discharge_record'
]

function RulesContent({ rules }: Pick<QualityRulesPopoverProps, 'rules'>) {
  const availableTypes = documentTypes.filter((type) => (rules[type] ?? []).length > 0)

  if (availableTypes.length === 0) {
    return (
      <div className="flex h-[220px] w-[456px] items-center justify-center">
        <Empty imageVariant="blueSimple" description="暂无质控规则" />
      </div>
    )
  }

  return (
    <div className="w-[640px] max-w-[calc(100vw-96px)]">
      <Tabs
        placement="left"
        size="small"
        className="[&_.ant-tabs-content-holder]:min-w-0 [&_.ant-tabs-nav]:max-h-[420px] [&_.ant-tabs-nav-list]:max-h-[420px] [&_.ant-tabs-nav-list]:overflow-y-auto [&_.ant-tabs-tab]:whitespace-nowrap [&_.ant-tabs-tabpane]:pl-12"
        items={availableTypes.map((type) => ({
          key: type,
          label: documentTypeLabel[type],
          children: (
            <div className="max-h-[420px] space-y-12 overflow-y-auto pr-4">
              {(rules[type] ?? []).map((rule) => (
                <article key={rule.id} className="rounded-lg border border-border-secondary bg-bg-container p-12">
                  <div className="flex items-start justify-between gap-16">
                    <div className="min-w-0">
                      <h3 className="m-0 text-base font-medium text-text">{rule.title}</h3>
                    </div>
                    <span className="shrink-0 text-base font-medium text-error">{rule.score}</span>
                  </div>
                </article>
              ))}
            </div>
          )
        }))}
      />
    </div>
  )
}

export default function QualityRulesPopover({ rules, children }: QualityRulesPopoverProps) {
  return (
    <Popover
      trigger="click"
      placement="rightTop"
      content={<RulesContent rules={rules} />}
      overlayClassName="[&_.ant-popover-inner]:rounded-lg [&_.ant-popover-inner]:p-16"
    >
      {children ?? (
        <Button variant="link" color="primary" className="px-0">
          查看质控规则
        </Button>
      )}
    </Popover>
  )
}
