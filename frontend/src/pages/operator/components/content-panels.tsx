import { Divider } from 'antd'
import Button from '../../../components/feedback/button'
import Card from '../../../components/data-display/card'
import Tag from '../../../components/data-display/tag'
import type { OperatorCaseData, OperatorModelOutput, OperatorTask } from '../../../types/operator'
import RichText from './rich-text'
import QualityRulesPopover from './quality-rules-popover'

type MedicalRecordPanelProps = {
  caseData: OperatorCaseData
  qualityRules: OperatorTask['quality_rules']
}

type ModelOutputPanelProps = {
  output: OperatorModelOutput
}

function severityState(severity: OperatorModelOutput['rules'][number]['severity']) {
  if (severity === 'high') return 'error'
  if (severity === 'medium') return 'warning'
  return 'success'
}

export function MedicalRecordPanel({ caseData, qualityRules }: MedicalRecordPanelProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col [&_.ant-card-body]:flex [&_.ant-card-body]:min-h-0 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex-col">
      <div className="mb-16 flex items-center justify-between gap-12">
        <div className="min-w-0">
          <h2 className="m-0 truncate text-lg font-medium text-text">住院号 {caseData.hospitalization_no}</h2>
        </div>
        <QualityRulesPopover rules={qualityRules}>
          <Button variant="link" color="primary" className="shrink-0 px-0">
            查看质控规则
          </Button>
        </QualityRulesPopover>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-4">
        {caseData.documents.map((document) => (
          <section key={document.id} className="mb-24 last:mb-0">
            <RichText content={document.content} />
          </section>
        ))}
      </div>
    </Card>
  )
}

export function ModelOutputPanel({ output }: ModelOutputPanelProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col [&_.ant-card-body]:flex [&_.ant-card-body]:min-h-0 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex-col">
      <div className="mb-16">
        <div className="flex items-center justify-between gap-12">
          <h2 className="m-0 text-lg font-medium text-text">结果 {output.side}</h2>
        </div>
      </div>
      <Divider className="my-0" />
      <div className="min-h-0 flex-1 overflow-y-auto pt-16">
        <section>
          <RichText content={output.conclusion} />
        </section>
        {output.rules.length ? (
          <section className="mt-16 space-y-12">
            {output.rules.map((rule) => (
              <article key={rule.id} className="rounded-lg border border-border-secondary bg-bg-container p-16">
                <div className="flex items-start justify-between gap-16">
                  <h3 className="m-0 text-base font-medium text-text">{rule.title}</h3>
                  <Tag appearance="filled" state={severityState(rule.severity)}>
                    {rule.score} 分
                  </Tag>
                </div>
                <p className="m-0 mt-8 text-sm leading-relaxed text-text-secondary">{rule.evidence}</p>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </Card>
  )
}
