import { ArrowLeftOutlined } from '@ant-design/icons'
import Button from '../../../components/feedback/button'
import type { OperatorPlanListItem, OperatorTask } from '../../../types/operator'
import OperatorStatusTag from './operator-status-tag'
import { MedicalRecordPanel, ModelOutputPanel } from './content-panels'

type AnnotationWorkbenchProps = {
  plan: OperatorPlanListItem
  task: OperatorTask
  onBack: () => void
  onAnnotate: () => void
}

export default function AnnotationWorkbench({ plan, task, onBack, onAnnotate }: AnnotationWorkbenchProps) {
  return (
    <div className="flex h-[calc(100vh-112px)] min-h-[680px] flex-col gap-16">
      <div className="flex min-h-[56px] items-center justify-between gap-16 rounded-lg border border-border-secondary bg-bg-container px-20 py-12">
        <div className="flex min-w-0 items-center gap-16">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回列表
          </Button>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-12">
              <h1 className="m-0 truncate text-lg font-medium text-text">{plan.name}</h1>
              <OperatorStatusTag status={plan.status} />
            </div>
            <p className="m-0 mt-4 text-sm text-text-secondary">
              当前任务 {task.sequence_no}/{task.total_tasks} · 进度 {plan.annotated_cases}/{plan.total_cases}
            </p>
          </div>
        </div>
        <Button color="primary" variant="solid" onClick={onAnnotate}>
          标注
        </Button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-16">
        <MedicalRecordPanel caseData={task.case_data} qualityRules={task.quality_rules} />
        <ModelOutputPanel output={task.outputs[0]} />
        <ModelOutputPanel output={task.outputs[1]} />
      </div>
    </div>
  )
}
