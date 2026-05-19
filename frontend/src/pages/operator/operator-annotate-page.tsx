import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { message } from 'antd'
import { fetchOperatorNextTask, submitOperatorAnnotation } from '../../api/operator'
import type { OperatorAnnotationPayload, OperatorPlanListItem, OperatorTask } from '../../types/operator'
import OperatorShell from './components/operator-shell'
import AnnotationWorkbench from './components/annotation-workbench'
import AnnotationModal, { type AnnotationModalMode } from './components/annotation-modal'
import ManualAnnotationWorkbench from './components/manual-annotation-workbench'
import { WorkbenchLoadingPanel, WorkbenchResultPanel } from './components/state-panels'

type WorkbenchState = 'loading' | 'ready' | 'complete' | 'error' | 'forbidden' | 'closed'

function parsePlanId(value: string | undefined) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export default function OperatorAnnotatePage() {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const planId = parsePlanId(params.planId ?? params.id)
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const previewState = searchParams.get('state')

  const [state, setState] = useState<WorkbenchState>('loading')
  const [plan, setPlan] = useState<OperatorPlanListItem | null>(null)
  const [task, setTask] = useState<OperatorTask | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<AnnotationModalMode>('normal')
  const [submitting, setSubmitting] = useState(false)

  function backToPlans() {
    navigate('/operator/plans')
  }

  const loadTask = useCallback(async () => {
    if (!planId) {
      setState('error')
      return
    }
    if (previewState === 'loading') {
      setState('loading')
      return
    }
    if (previewState === 'error') {
      setState('error')
      return
    }
    if (previewState === 'forbidden') {
      setState('forbidden')
      return
    }
    if (previewState === 'closed') {
      setState('closed')
      return
    }
    if (previewState === 'complete') {
      setState('complete')
      return
    }

    setState('loading')
    try {
      const response = await fetchOperatorNextTask(planId)
      setPlan(response.plan)
      setTask(response.task)
      if (response.plan.status === 'closed') {
        setState('closed')
      } else if (response.plan.status === 'completed' || !response.task) {
        setState('complete')
      } else {
        setState('ready')
        if (previewState === 'modal' || previewState === 'validation' || previewState === 'submitting') {
          setModalMode(previewState === 'modal' ? 'normal' : previewState)
          setModalOpen(true)
        }
      }
    } catch (error) {
      const status = typeof error === 'object' && error && 'response' in error ? (error.response as { status?: number } | undefined)?.status : undefined
      setState(status === 403 ? 'forbidden' : status === 409 ? 'closed' : 'error')
    }
  }, [planId, previewState])

  useEffect(() => {
    void loadTask()
  }, [loadTask])

  async function submitAnnotation(payload: OperatorAnnotationPayload) {
    if (!planId || !task) return
    setSubmitting(true)
    try {
      const response = await submitOperatorAnnotation(planId, task.id, payload)
      setPlan(response.plan)
      if (response.next_task) {
        setTask(response.next_task)
        setState('ready')
        setModalOpen(false)
        message.success('标注已提交，已进入下一条任务。')
      } else {
        setTask(null)
        setModalOpen(false)
        setState('complete')
        message.success('标注已提交，当前计划已完成。')
      }
    } catch {
      message.error('标注提交失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OperatorShell mainClassName="p-16 md:p-24">
      {state === 'loading' ? <WorkbenchLoadingPanel /> : null}
      {state === 'error' ? <WorkbenchResultPanel kind="error" onRetry={() => void loadTask()} onBack={backToPlans} /> : null}
      {state === 'forbidden' ? <WorkbenchResultPanel kind="forbidden" onBack={backToPlans} /> : null}
      {state === 'closed' ? <WorkbenchResultPanel kind="closed" onBack={backToPlans} /> : null}
      {state === 'complete' ? <WorkbenchResultPanel kind="complete" onBack={backToPlans} /> : null}
      {state === 'ready' && plan && task && task.annotation_type === 'manual' ? (
        <ManualAnnotationWorkbench
          plan={plan}
          task={task}
          previewState={previewState}
          submitting={submitting}
          onBack={backToPlans}
          onSubmittingChange={setSubmitting}
          onSubmitted={(nextTask, nextPlan, completed) => {
            setPlan(nextPlan)
            if (completed || !nextTask) {
              setTask(null)
              setState('complete')
              return
            }
            setTask(nextTask)
            setState('ready')
          }}
        />
      ) : null}
      {state === 'ready' && plan && task && task.annotation_type === 'comparison' ? (
        <>
          <AnnotationWorkbench
            plan={plan}
            task={task}
            onBack={backToPlans}
            onAnnotate={() => {
              setModalMode('normal')
              setModalOpen(true)
            }}
          />
          <AnnotationModal
            open={modalOpen}
            task={task}
            mode={modalMode}
            submitting={submitting}
            onCancel={() => setModalOpen(false)}
            onSubmit={submitAnnotation}
          />
        </>
      ) : null}
    </OperatorShell>
  )
}
