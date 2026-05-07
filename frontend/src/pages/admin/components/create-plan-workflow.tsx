import { useState } from 'react'
import Form from '../../../components/data-entry/form'
import Input from '../../../components/data-entry/input'
import Select from '../../../components/data-entry/select'
import Button from '../../../components/feedback/button'
import UploadDataStep from './upload-data-step'
import type { CreatePlanPayload, ImportSummary, OperatorOption } from '../../../types/plan'

export type CreatePlanStep = 'basic' | 'upload'

type CreatePlanWorkflowProps = {
  step: CreatePlanStep
  owners: OperatorOption[]
  basicValues: CreatePlanPayload | null
  importSummary: ImportSummary | null
  creating?: boolean
  uploading?: boolean
  onCreateBasic: (values: CreatePlanPayload) => Promise<void>
  onUploadCsv: (file: File) => Promise<ImportSummary | null>
  onBackToBasic: () => void
  onCancel: () => void
  onFinish: () => void
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function StepItem({ active, done, index, title }: { active?: boolean; done?: boolean; index: number; title: string }) {
  return (
    <div className={cx('rounded-lg p-12', active && 'bg-[var(--color-primary-bg)]')}>
      <div
        className={cx(
          'text-base',
          done && 'font-semibold text-[var(--color-success)]',
          active && 'font-semibold text-[var(--color-primary)]',
          !done && !active && 'font-medium text-[var(--color-text)]'
        )}
      >
        {index}. {title}
      </div>
    </div>
  )
}

export default function CreatePlanWorkflow({
  step,
  owners,
  basicValues,
  importSummary,
  creating,
  uploading,
  onCreateBasic,
  onUploadCsv,
  onBackToBasic,
  onCancel,
  onFinish
}: CreatePlanWorkflowProps) {
  const [fileName, setFileName] = useState<string>()
  const workflowHeight = step === 'upload' ? ((importSummary?.failed_rows ?? 0) > 0 ? 'min-h-[640px]' : 'min-h-[540px]') : 'min-h-[520px]'

  return (
    <div className="flex flex-col gap-16">
      <div className="flex items-center gap-8 text-caption font-normal">
        <button type="button" className="border-0 bg-transparent p-0 font-normal text-[var(--color-primary)]" onClick={onCancel}>
          标注计划
        </button>
        <span className="text-[var(--color-text-secondary)]">/</span>
        <span className="text-[var(--color-text)]">新建计划</span>
      </div>
      <h1 className="m-0 text-heading-3 font-semibold leading-heading-3">新建标注计划</h1>
      <div className={cx('flex gap-16', workflowHeight)}>
        <aside className="flex w-[260px] shrink-0 flex-col gap-16 rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16">
          <StepItem index={1} active={step === 'basic'} done={step === 'upload'} title="基础信息" />
          <StepItem index={2} active={step === 'upload'} title="上传数据" />
        </aside>
        <section className="min-w-0 flex-1 rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-24">
          {step === 'basic' ? (
            <div className="flex h-full flex-col">
              <div className="mb-16 text-lg font-semibold">基础信息</div>
              <Form<CreatePlanPayload>
                itemLayout="vertical"
                className="max-w-[640px] [&_.ant-form-item]:mb-16"
                initialValues={basicValues ?? undefined}
                onFinish={onCreateBasic}
              >
                <Form renderMode="item" label="计划名称" itemProps={{ name: 'name', rules: [{ required: true, message: '请输入计划名称' }] }}>
                  <Input placeholder="请输入计划名称" />
                </Form>
                <Form renderMode="item" label="计划说明" itemProps={{ name: 'description' }}>
                  <Input kind="textarea" placeholder="请输入计划说明" rows={4} />
                </Form>
                <Form
                  renderMode="item"
                  label="负责人"
                  itemProps={{ name: 'owner_user_id', rules: [{ required: true, message: '请选择负责人' }] }}
                >
                  <Select<number>
                    placeholder="请选择负责人"
                    options={owners.map((owner) => ({ label: owner.username, value: owner.id }))}
                    className="w-full [&_.ant-select-selection-placeholder]:!text-[var(--color-text-disabled)]"
                  />
                </Form>
                <div className="mt-8 flex justify-end gap-8">
                  <Button onClick={onCancel}>取消</Button>
                  <Button color="primary" variant="solid" htmlType="submit" loading={creating}>
                    下一步
                  </Button>
                </div>
              </Form>
            </div>
          ) : (
            <UploadDataStep
              importSummary={importSummary}
              fileName={fileName}
              uploading={uploading}
              onUploadCsv={async (file) => {
                  setFileName(file.name)
                  return onUploadCsv(file)
              }}
              onBackToBasic={onBackToBasic}
              onFinish={onFinish}
            />
          )}
        </section>
      </div>
    </div>
  )
}
