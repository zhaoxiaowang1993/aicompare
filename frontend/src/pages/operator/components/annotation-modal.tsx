import { useEffect } from 'react'
import { Form as AntForm } from 'antd'
import type { CheckboxOptionType } from 'antd/es/checkbox/Group'
import Button from '../../../components/feedback/button'
import ModalDialog from '../../../components/feedback/modal-dialog'
import Form from '../../../components/data-entry/form'
import Input from '../../../components/data-entry/input'
import Radio from '../../../components/data-entry/radio'
import Checkbox from '../../../components/data-entry/checkbox'
import type { OperatorAnnotationDecision, OperatorAnnotationPayload, OperatorAnnotationReason, OperatorTask } from '../../../types/operator'
import { decisionLabel, reasonLabel } from '../operator-format'

export type AnnotationModalMode = 'normal' | 'validation' | 'submitting'

type AnnotationFormValues = {
  decision?: OperatorAnnotationDecision
  reason_codes?: OperatorAnnotationReason[]
  note?: string
}

type AnnotationModalProps = {
  open: boolean
  task: OperatorTask | null
  mode?: AnnotationModalMode
  submitting?: boolean
  onCancel: () => void
  onSubmit: (payload: OperatorAnnotationPayload) => Promise<void>
}

const decisionOptions: Array<{ label: string; value: OperatorAnnotationDecision }> = [
  { label: decisionLabel.A_BETTER, value: 'A_BETTER' },
  { label: decisionLabel.B_BETTER, value: 'B_BETTER' },
  { label: decisionLabel.BOTH_GOOD, value: 'BOTH_GOOD' },
  { label: decisionLabel.BOTH_BAD, value: 'BOTH_BAD' }
]

const reasonOptions: CheckboxOptionType<OperatorAnnotationReason>[] = [
  { label: reasonLabel.NO_HIT_ERROR_RULE, value: 'NO_HIT_ERROR_RULE' },
  { label: reasonLabel.NO_MISSING_RULE, value: 'NO_MISSING_RULE' },
  { label: reasonLabel.NO_OVER_QC, value: 'NO_OVER_QC' },
  { label: reasonLabel.OTHER, value: 'OTHER' }
]

function hasOther(values: AnnotationFormValues) {
  return values.reason_codes?.includes('OTHER') ?? false
}

export default function AnnotationModal({ open, task, mode = 'normal', submitting = false, onCancel, onSubmit }: AnnotationModalProps) {
  const [form] = AntForm.useForm<AnnotationFormValues>()
  const previewSubmitting = mode === 'submitting'
  const effectiveSubmitting = submitting || previewSubmitting

  useEffect(() => {
    if (!open) return
    if (mode === 'validation') {
      form.setFieldsValue({ decision: undefined, reason_codes: [], note: '' })
      form.setFields([
        { name: 'decision', errors: ['请选择标注结论'] },
        { name: 'reason_codes', errors: ['请选择标注原因'] }
      ])
      return
    }
    if (mode === 'submitting') {
      form.setFieldsValue({
        decision: 'A_BETTER',
        reason_codes: ['NO_MISSING_RULE', 'NO_OVER_QC'],
        note: 'A 输出覆盖规则更完整，未发现过度质控。'
      })
      return
    }
    form.resetFields()
  }, [form, mode, open])

  async function finish(values: AnnotationFormValues) {
    if (!values.decision || !values.reason_codes?.length) return
    await onSubmit({
      decision: values.decision,
      reason_codes: values.reason_codes,
      other_reason_text: hasOther(values) ? values.note?.trim() || null : null,
      notes: values.note?.trim() || null
    })
  }

  return (
    <ModalDialog
      open={open}
      centered
      size="medium"
      title="提交标注结论"
      mask
      footerContentType="slot"
      onCancel={effectiveSubmitting ? undefined : onCancel}
      destroyOnClose
      className="[&_.ant-modal-content]:p-0 [&_.ant-modal-header]:px-24 [&_.ant-modal-header]:pt-24 [&_.ant-modal-body]:px-24 [&_.ant-modal-body]:py-16"
      footerSlot={
        <div className="flex items-center justify-end gap-12 px-24 py-16">
          <Button disabled={effectiveSubmitting} onClick={onCancel}>
            取消
          </Button>
          <Button color="primary" variant="solid" loading={effectiveSubmitting} onClick={() => form.submit()}>
            {effectiveSubmitting ? '提交中' : '提交标注'}
          </Button>
        </div>
      }
    >
      <Form<AnnotationFormValues> form={form} onFinish={(values) => void finish(values)} className="operator-annotation-form">
        <div className="mb-16 rounded-lg bg-fill-quaternary p-12 text-sm text-text-secondary">
          <span className="text-text">住院号 {task?.case_data.hospitalization_no ?? '-'}</span>
          <span className="mx-8">/</span>
          <span>
            当前任务 {task?.sequence_no ?? '-'}/{task?.total_tasks ?? '-'}
          </span>
        </div>

        <AntForm.Item
          name="decision"
          label="标注结论"
          rules={[{ required: true, message: '请选择标注结论' }]}
          className="[&_.ant-form-item-explain-error]:text-caption [&_.ant-form-item-explain-error]:text-error"
        >
          <Radio
            mode="button"
            size="large"
            value={form.getFieldValue('decision')}
            options={decisionOptions}
            onGroupChange={(event) => {
              form.setFieldValue('decision', event.target.value)
              void form.validateFields(['decision'])
            }}
            className="flex flex-wrap gap-8 [&_.ant-radio-button-wrapper]:rounded-md [&_.ant-radio-button-wrapper]:border [&_.ant-radio-button-wrapper]:before:hidden"
          />
        </AntForm.Item>

        <AntForm.Item<AnnotationFormValues>
          name="reason_codes"
          label="标注原因"
          required
          rules={[
            {
              validator: (_, value: OperatorAnnotationReason[] | undefined) =>
                value?.length ? Promise.resolve() : Promise.reject(new Error('请选择标注原因'))
            }
          ]}
          className="[&_.ant-form-item-explain-error]:text-caption [&_.ant-form-item-explain-error]:text-error"
        >
          <Checkbox
            mode="group"
            value={form.getFieldValue('reason_codes') ?? []}
            options={reasonOptions}
            onGroupChange={(values) => {
              const reasonCodes = values as OperatorAnnotationReason[]
              form.setFieldValue('reason_codes', reasonCodes)
              void form.validateFields(['reason_codes'])
              void form.validateFields(['note'])
            }}
            className="grid grid-cols-2 gap-x-20 gap-y-12"
          />
        </AntForm.Item>

        <AntForm.Item shouldUpdate noStyle>
          {({ getFieldsValue }) => (
            <AntForm.Item
              name="note"
              label="补充说明"
              rules={[
                {
                  validator: (_, value: string | undefined) => {
                    if (!hasOther(getFieldsValue())) return Promise.resolve()
                    return value?.trim() ? Promise.resolve() : Promise.reject(new Error('请填写其他原因'))
                  }
                }
              ]}
              className="[&_.ant-form-item-explain-error]:text-caption [&_.ant-form-item-explain-error]:text-error"
            >
              <Input kind="textarea" rows={4} className="min-h-[96px]" placeholder="可补充说明判断依据；选择其他时必填" />
            </AntForm.Item>
          )}
        </AntForm.Item>
      </Form>
    </ModalDialog>
  )
}
