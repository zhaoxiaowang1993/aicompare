import { Form as AntForm } from 'antd'
import { useEffect } from 'react'
import Form from '../../../components/data-entry/form'
import Input from '../../../components/data-entry/input'
import Select from '../../../components/data-entry/select'
import Button from '../../../components/feedback/button'
import ModalDialog from '../../../components/feedback/modal-dialog'
import type { QualityRule, RuleCategory, RuleCreatePayload } from '../../../types/rules'
import { ruleCategories, ruleCategoryOptions } from '../../../types/rules'

export type RuleFormValues = RuleCreatePayload

interface RuleFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  rule?: QualityRule | null
  submitting?: boolean
  onCancel: () => void
  onSubmit: (values: RuleFormValues) => Promise<void>
}

const categoryOptions = ruleCategoryOptions.map((item) => ({
  label: item.label,
  value: item.value
}))

function isCategory(value: string): value is RuleCategory {
  return ruleCategories.includes(value as RuleCategory)
}

export default function RuleFormModal({ open, mode, rule, submitting = false, onCancel, onSubmit }: RuleFormModalProps) {
  const [form] = AntForm.useForm<RuleFormValues>()

  useEffect(() => {
    if (!open) return
    form.setFieldsValue({
      category: rule?.category,
      content: rule?.content ?? '',
      score: rule?.score ?? ''
    })
  }, [form, open, rule])

  async function submitForm() {
    const values = await form.validateFields()
    if (!isCategory(values.category)) {
      form.setFields([{ name: 'category', errors: ['请选择有效的规则分类'] }])
      return
    }
    await onSubmit({
      category: values.category,
      content: values.content.trim(),
      score: values.score.trim()
    })
  }

  return (
    <ModalDialog
      open={open}
      title={mode === 'create' ? '新增质控规则' : '编辑质控规则'}
      size="default"
      centered
      destroyOnHidden
      onCancel={onCancel}
      footerContentType="slot"
      footerSlot={
        <div className="flex justify-end gap-8">
          <Button onClick={onCancel}>取消</Button>
          <Button color="primary" variant="solid" loading={submitting} onClick={submitForm}>
            {mode === 'create' ? '提交' : '保存'}
          </Button>
        </div>
      }
      className="[&_.ant-modal-body]:pt-8"
    >
      <Form<RuleFormValues> form={form} itemLayout="vertical" className="[&_.ant-form-item]:mb-16">
        <Form
          renderMode="item"
          label="规则分类"
          itemProps={{ name: 'category', rules: [{ required: true, message: '请选择规则分类' }] }}
        >
          <Select<RuleCategory>
            placeholder="请选择规则分类"
            options={categoryOptions}
            className="w-full [&_.ant-select-selection-placeholder]:!text-[var(--color-text-disabled)]"
          />
        </Form>
        <Form
          renderMode="item"
          label="规则内容"
          itemProps={{ name: 'content', rules: [{ required: true, whitespace: true, message: '请输入规则内容' }] }}
        >
          <Input kind="textarea" placeholder="请输入规则内容" rows={5} className="min-h-[104px]" />
        </Form>
        <Form
          renderMode="item"
          label="分值"
          itemProps={{ name: 'score', rules: [{ required: true, whitespace: true, message: '请输入分值' }] }}
        >
          <Input placeholder="请输入分值" />
        </Form>
      </Form>
    </ModalDialog>
  )
}
