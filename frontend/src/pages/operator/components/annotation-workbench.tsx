import { ArrowLeftOutlined } from '@ant-design/icons'
import Button from '../../../components/feedback/button'
import type { OperatorPlanListItem, OperatorTask } from '../../../types/operator'
import { operatorPlanStatusText } from './operator-status-tag'
import { MedicalRecordPanel, ModelOutputPanel } from './content-panels'

type AnnotationWorkbenchProps = {
  plan: OperatorPlanListItem
  task: OperatorTask
  onBack: () => void
  onAnnotate: () => void
}

export default function AnnotationWorkbench({ plan, task, onBack, onAnnotate }: AnnotationWorkbenchProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] min-h-[680px] flex-col">
      <div className="flex h-[64px] shrink-0 items-center justify-between gap-16 border-b border-border-secondary bg-bg-container px-24">
        <div className="flex min-w-0 items-center gap-16">
          <Button variant="link" color="primary" icon={<ArrowLeftOutlined />} className="px-0" onClick={onBack}>
            返回列表
          </Button>
          <h1 className="m-0 truncate text-lg font-semibold text-text">{plan.name}</h1>
          <span className="shrink-0 rounded-full bg-primary-bg px-8 py-2 text-xs font-normal text-primary">
            {operatorPlanStatusText[plan.status]} {task.sequence_no}/{task.total_tasks}
          </span>
        </div>
        <Button color="primary" variant="solid" onClick={onAnnotate}>
          标注
        </Button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-16 p-20">
        <MedicalRecordPanel caseData={task.case_data} qualityRules={task.quality_rules} />
        <ModelOutputPanel output={task.outputs[0]} />
        <ModelOutputPanel output={task.outputs[1]} />
      </div>
    </div>
  )
}
