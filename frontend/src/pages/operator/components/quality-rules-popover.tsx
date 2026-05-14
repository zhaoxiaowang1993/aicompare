import { Popover } from 'antd'
import type { ReactNode } from 'react'
import Button from '../../../components/feedback/button'
import Tabs from '../../../components/navigation/tabs'
import type { OperatorDocumentType, OperatorQualityRule } from '../../../types/operator'
import { documentTypeLabel } from '../operator-format'

type QualityRulesPopoverProps = {
  rules: Record<OperatorDocumentType, OperatorQualityRule[]>
  children?: ReactNode
}

const documentTypes: OperatorDocumentType[] = ['admission', 'first_course', 'superior_round', 'daily_course', 'discharge']

function RulesContent({ rules }: Pick<QualityRulesPopoverProps, 'rules'>) {
  return (
    <div className="w-[456px]">
      <Tabs
        size="small"
        items={documentTypes.map((type) => ({
          key: type,
          label: documentTypeLabel[type],
          children: (
            <div className="mt-8 max-h-[420px] space-y-12 overflow-y-auto pr-4">
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
