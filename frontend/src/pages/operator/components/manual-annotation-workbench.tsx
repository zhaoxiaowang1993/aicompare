import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/feedback/button'
import ModalDialog from '../../../components/feedback/modal-dialog'
import { submitManualAnnotation } from '../../../api/operator'
import type { ManualAnnotationSubmitPayload, OperatorPlanListItem, OperatorTask } from '../../../types/operator'
import type { OperatorDocumentType } from '../../../types/operator'
import ManualAnnotationLayout, {
  type ManualLayoutEntry,
  type ManualLayoutFormState,
  type ManualLayoutFormValue,
  type ManualQualityRuleOption
} from '../../shared/manual-annotation-layout'
import OperatorStatusTag from './operator-status-tag'
import OperatorPlanTypeTag from './operator-plan-type-tag'

type ManualAnnotationWorkbenchProps = {
  plan: OperatorPlanListItem
  task: OperatorTask
  previewState?: string | null
  submitting?: boolean
  onBack: () => void
  onSubmitted: (nextTask: OperatorTask | null, nextPlan: OperatorPlanListItem, completed: boolean) => void
  onSubmittingChange: (submitting: boolean) => void
}

function firstDocumentText(task: OperatorTask) {
  return task.case_data.documents[0]?.content ?? ''
}

const documentTypeLabels: Record<OperatorDocumentType, string> = {
  admission: '入院记录',
  first_course: '首次病程',
  superior_round: '上级查房',
  daily_course: '日常病程',
  discharge: '出院记录'
}

function flattenRules(task: OperatorTask): ManualQualityRuleOption[] {
  return Object.entries(task.quality_rules).flatMap(([category, rules]) =>
    rules.map((rule) => ({
      id: rule.id,
      category: documentTypeLabels[category as OperatorDocumentType] ?? category,
      title: rule.title,
      content: rule.description || rule.title,
      score: rule.score
    }))
  )
}

function presetEntries(task: OperatorTask, rules: ManualQualityRuleOption[]): ManualLayoutEntry[] {
  const recordText = firstDocumentText(task)
  const snippets = ['患者入院后未及时完善入院记录', '未见心电图完成时间记录', '未见肌钙蛋白复查计划']
  return snippets.map((snippet, index) => {
    const startOffset = recordText.indexOf(snippet)
    const rule = rules[index] ?? rules[0]
    return {
      id: String(index + 1),
      sourceText: snippet,
      startOffset,
      endOffset: startOffset + snippet.length,
      qualityRuleId: rule.id,
      qualityRuleTitle: rule.title,
      qualityRuleContent: rule.content,
      qualityRuleScore: rule.score,
      suggestion: index === 0 ? '补充入院记录完成时间及相关病程描述' : index === 1 ? '补充心电图检查时间与结果摘要' : '补充肌钙蛋白复查时间点',
      notes: index === 0 ? '需核对实际入院时间' : null,
      createdAt: '2026-04-22 10:21'
    }
  })
}

function shouldUsePresetEntries(previewState?: string | null) {
  if (previewState === 'default') return false
  return previewState === 'edit' || previewState === 'delete' || previewState === 'confirm-has'
}

function previewFormState(previewState: string | null | undefined, recordText: string, presetEntryList: ManualLayoutEntry[]) {
  if (previewState === 'new' || previewState === 'validation') {
    const sourceText = '患者入院后未及时完善入院记录'
    const startOffset = recordText.indexOf(sourceText)
    return { mode: 'create' as const, values: { sourceText, startOffset, endOffset: startOffset + sourceText.length } }
  }
  if (previewState === 'edit') {
    const entry = presetEntryList[0]
    if (!entry) return null
    return {
      mode: 'edit' as const,
      entryId: entry.id,
      values: {
        sourceText: entry.sourceText,
        startOffset: entry.startOffset,
        endOffset: entry.endOffset,
        qualityRuleId: entry.qualityRuleId,
        suggestion: entry.suggestion,
        notes: entry.notes
      }
    }
  }
  return null
}

function toPayloadEntry(entry: ManualLayoutEntry) {
  return {
    source_text: entry.sourceText,
    start_offset: entry.startOffset,
    end_offset: entry.endOffset,
    quality_rule_id: entry.qualityRuleId,
    quality_rule_title: entry.qualityRuleTitle,
    quality_rule_content: entry.qualityRuleContent,
    quality_rule_score: entry.qualityRuleScore,
    suggestion: entry.suggestion,
    notes: entry.notes
  }
}

function ConfirmationContent({
  tone,
  title,
  description
}: {
  tone: 'warning' | 'error'
  title: string
  description: string
}) {
  const toneClass = tone === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-warning)]'
  return (
    <div className="flex gap-12 py-8">
      <ExclamationCircleFilled className={`mt-2 shrink-0 text-[22px] ${toneClass}`} />
      <div className="flex min-w-0 flex-col gap-8">
        <div className="text-heading-5 font-semibold leading-heading-5 text-[var(--color-text)]">{title}</div>
        <div className="text-base font-normal leading-normal text-[var(--color-text-secondary)]">{description}</div>
      </div>
    </div>
  )
}

export default function ManualAnnotationWorkbench({
  plan,
  task,
  previewState,
  submitting,
  onBack,
  onSubmitted,
  onSubmittingChange
}: ManualAnnotationWorkbenchProps) {
  const rules = useMemo(() => flattenRules(task), [task])
  const recordText = firstDocumentText(task)
  const presetEntryList = useMemo(() => presetEntries(task, rules), [task, rules])
  const initialEntries = useMemo(() => (shouldUsePresetEntries(previewState) ? presetEntryList : []), [previewState, presetEntryList])
  const [entries, setEntries] = useState<ManualLayoutEntry[]>(initialEntries)
  const [formState, setFormState] = useState<ManualLayoutFormState | null>(() => previewFormState(previewState, recordText, presetEntryList))
  const [deleteTarget, setDeleteTarget] = useState<ManualLayoutEntry | null>(() => (previewState === 'delete' ? presetEntryList[0] ?? null : null))
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(previewState === 'confirm-has' || previewState === 'confirm-none')
  const submitConfirmTitle =
    entries.length > 0 ? `当前病历已标记${entries.length}条质控问题，是否确认提交？` : '当前病历未标记质控问题，是否确认提交？'

  useEffect(() => {
    setEntries(initialEntries)
    setFormState(previewFormState(previewState, recordText, presetEntryList))
    setDeleteTarget(previewState === 'delete' ? presetEntryList[0] ?? null : null)
    setSubmitConfirmOpen(previewState === 'confirm-has' || previewState === 'confirm-none')
  }, [task.id, previewState, recordText, presetEntryList, initialEntries])

  function saveEntry(values: ManualLayoutFormValue) {
    const rule = rules.find((item) => item.id === values.qualityRuleId)
    if (!rule || !values.suggestion) return
    if (formState?.mode === 'edit') {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === formState.entryId
            ? {
                ...entry,
                qualityRuleId: rule.id,
                qualityRuleTitle: rule.title,
                qualityRuleContent: rule.content,
                qualityRuleScore: rule.score,
                suggestion: values.suggestion ?? '',
                notes: values.notes
              }
            : entry
        )
      )
      message.success('标注条目已保存。')
    } else {
      setEntries((current) => [
        ...current,
        {
          id: String(current.length + 1),
          sourceText: values.sourceText,
          startOffset: values.startOffset,
          endOffset: values.endOffset,
          qualityRuleId: rule.id,
          qualityRuleTitle: rule.title,
          qualityRuleContent: rule.content,
          qualityRuleScore: rule.score,
          suggestion: values.suggestion ?? '',
          notes: values.notes,
          createdAt: new Date().toISOString()
        }
      ])
    }
    setFormState(null)
  }

  function deleteEntry(target: ManualLayoutEntry) {
    setEntries((current) => current.filter((entry) => entry.id !== target.id))
    setFormState((current) => {
      if (!current) return current
      if (current.mode === 'edit' && current.entryId === target.id) return null
      if (current.values.startOffset === target.startOffset && current.values.endOffset === target.endOffset) return null
      return current
    })
    setDeleteTarget(null)
  }

  async function confirmSubmit() {
    const payload: ManualAnnotationSubmitPayload = {
      result: entries.length > 0 ? 'has_issues' : 'no_issue',
      entries: entries.map(toPayloadEntry)
    }
    onSubmittingChange(true)
    try {
      const response = await submitManualAnnotation(plan.id, task.id, payload)
      message.success(response.completed ? '标注已提交，当前计划已完成。' : '标注已提交，已进入下一条任务。')
      setSubmitConfirmOpen(false)
      onSubmitted(response.next_task, response.plan, response.completed)
    } catch {
      message.error('手动标注提交失败，请稍后重试。')
    } finally {
      onSubmittingChange(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-112px)] min-h-[760px] flex-col gap-16">
      <div className="flex min-h-[64px] items-center justify-between gap-16 rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] px-20 py-12">
        <div className="flex min-w-0 items-center gap-16">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回列表
          </Button>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-12">
              <h1 className="m-0 truncate text-lg font-medium text-[var(--color-text)]">{plan.name}</h1>
              <OperatorPlanTypeTag type={plan.annotation_type} />
              <OperatorStatusTag status={plan.status} />
            </div>
            <p className="m-0 mt-4 text-sm text-[var(--color-text-secondary)]">
              当前任务 {task.sequence_no}/{task.total_tasks} · 进度 {plan.annotated_cases}/{plan.total_cases}
            </p>
          </div>
        </div>
        <Button color="primary" variant="solid" onClick={() => setSubmitConfirmOpen(true)}>
          提交
        </Button>
      </div>
      <ManualAnnotationLayout
        recordText={recordText}
        hospitalizationNo={task.case_data.hospitalization_no}
        entries={entries}
        rules={rules}
        formState={formState}
        forceValidationPreview={previewState === 'validation'}
        onSelectText={(values) => setFormState({ mode: 'create', values })}
        onEdit={(entry) =>
          setFormState({
            mode: 'edit',
            entryId: entry.id,
            values: {
              sourceText: entry.sourceText,
              startOffset: entry.startOffset,
              endOffset: entry.endOffset,
              qualityRuleId: entry.qualityRuleId,
              suggestion: entry.suggestion,
              notes: entry.notes
            }
          })
        }
        onDelete={setDeleteTarget}
        onCancelForm={() => setFormState(null)}
        onSaveForm={saveEntry}
      />
      <ModalDialog
        kind="dialog"
        open={Boolean(deleteTarget)}
        centered
        title={null}
        footerContentType="slot"
        onCancel={() => setDeleteTarget(null)}
        footerSlot={
          <div className="flex justify-end gap-8">
            <Button onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button
              color="danger"
              variant="solid"
              onClick={() => {
                if (deleteTarget) deleteEntry(deleteTarget)
              }}
            >
              删除
            </Button>
          </div>
        }
      >
        <ConfirmationContent tone="error" title="确认删除该质控问题条目？" description="删除后左侧对应高亮也会同步移除。" />
      </ModalDialog>
      <ModalDialog
        kind="dialog"
        open={submitConfirmOpen}
        centered
        title={null}
        footerContentType="slot"
        onCancel={() => setSubmitConfirmOpen(false)}
        footerSlot={
          <div className="flex justify-end gap-8">
            <Button disabled={submitting} onClick={() => setSubmitConfirmOpen(false)}>
              取消
            </Button>
            <Button color="primary" variant="solid" loading={submitting} onClick={confirmSubmit}>
              确认提交
            </Button>
          </div>
        }
      >
        <ConfirmationContent tone="warning" title={submitConfirmTitle} description="提交后将不能新增/修改质控建议。" />
      </ModalDialog>
    </div>
  )
}
