import { CheckCircleFilled, CloseCircleFilled, DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import Button from '../../../components/feedback/button'
import ModalDialog from '../../../components/feedback/modal-dialog'
import Upload from '../../../components/data-entry/upload'
import type { RuleImportRowError, RuleImportSummary } from '../../../types/rules'

interface RuleImportModalProps {
  open: boolean
  importing: boolean
  summary: RuleImportSummary | null
  fileName?: string | null
  onCancel: () => void
  onDownloadTemplate: () => void
  onValidate: (file: File) => Promise<void>
  onConfirmImport: () => Promise<void>
  onReset: () => void
}

function summaryTitle(summary: RuleImportSummary | null) {
  if (!summary) return '批量创建质控规则'
  if (summary.failed_rows > 0) return `校验发现 ${summary.failed_rows} 条错误数据`
  return `校验通过，可导入 ${summary.success_rows} 条规则`
}

function errorDetail(error: RuleImportRowError) {
  if (error.raw_value) {
    const fieldText = error.field === 'category' ? '规则分类' : error.field === 'content' ? '规则内容' : error.field === 'score' ? '分值' : '原始数据'
    return `${fieldText}：${error.raw_value}`
  }
  if (error.field === 'category') return '规则分类：空'
  if (error.field === 'content') return '规则内容：空'
  if (error.field === 'score') return '分值：空'
  return '请检查该行数据格式'
}

export default function RuleImportModal({
  open,
  importing,
  summary,
  fileName,
  onCancel,
  onDownloadTemplate,
  onValidate,
  onConfirmImport,
  onReset
}: RuleImportModalProps) {
  function uploadRequest(options: Parameters<NonNullable<UploadProps['customRequest']>>[0]) {
    const file = options.file as File
    void onValidate(file)
      .then(() => options.onSuccess?.('ok'))
      .catch((error: unknown) => options.onError?.(error as Error))
  }

  const hasSuccessfulValidation = Boolean(summary && summary.failed_rows === 0)
  const hasFailedValidation = Boolean(summary && summary.failed_rows > 0)
  const visibleErrors = summary?.errors.slice(0, 50) ?? []

  function renderFooter() {
    if (hasSuccessfulValidation) {
      return (
        <div className="flex justify-end">
          <Button color="primary" variant="solid" loading={importing} onClick={onConfirmImport}>
            导入
          </Button>
        </div>
      )
    }

    if (hasFailedValidation) {
      return (
        <div className="flex justify-end">
          <Button color="primary" variant="solid" onClick={onReset}>
            重新上传
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <ModalDialog
      open={open}
      title="批量创建质控规则"
      size="medium"
      centered
      destroyOnHidden
      onCancel={onCancel}
      footerContentType="slot"
      footerSlot={renderFooter()}
      className="[&_.ant-modal-body]:pt-8"
    >
      <div className="flex flex-col gap-16">
        {summary ? (
          <div className={hasFailedValidation ? 'flex flex-col gap-16' : 'flex flex-col'}>
            {hasSuccessfulValidation ? (
              <div className="flex h-[96px] items-center gap-12 rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-20">
                <CheckCircleFilled className="text-[24px] text-[var(--color-success)]" />
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="text-base font-semibold text-[var(--color-text)]">{summaryTitle(summary)}</div>
                  <div className="truncate text-sm font-normal text-[var(--color-text-secondary)]">文件 {fileName || 'CSV 文件'} 已完成校验</div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-[88px] items-center gap-12 rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-20">
                  <CloseCircleFilled className="text-[24px] text-[var(--color-error)]" />
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="text-base font-semibold text-[var(--color-text)]">{summaryTitle(summary)}</div>
                    <div className="text-sm font-normal text-[var(--color-text-secondary)]">请修正缺项或规则分类不在范围内的数据后重新上传</div>
                  </div>
                </div>
                <div className="h-[440px] overflow-hidden rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)]">
                  <div className="flex items-center justify-between border-b border-[var(--color-border-secondary)] px-16 py-12">
                    <div className="text-base font-semibold text-[var(--color-text)]">错误条目</div>
                    <div className="text-sm font-normal text-[var(--color-text-secondary)]">展示前 50 条，可滚动查看</div>
                  </div>
                  <div className="max-h-[388px] overflow-auto">
                    {visibleErrors.map((error) => (
                      <div key={`${error.row_number}-${error.field}-${error.reason}`} className="flex min-h-[88px] gap-12 border-b border-[var(--color-border-secondary)] px-16 py-14 last:border-b-0">
                        <span className="mt-2 shrink-0 rounded bg-[var(--color-error-bg)] px-8 py-2 text-caption font-normal text-[var(--color-error)]">
                          第{error.row_number}行
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                          <div className="text-base font-semibold text-[var(--color-error)]">{error.reason}</div>
                          <div className="truncate text-sm font-normal text-[var(--color-text-secondary)]">{errorDetail(error)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16">
              <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4">
                  <div className="text-base font-semibold text-[var(--color-text)]">CSV 模板</div>
                  <div className="text-sm font-normal text-[var(--color-text-secondary)]">包含规则分类、规则内容、分值三列</div>
                </div>
                <Button icon={<DownloadOutlined />} onClick={onDownloadTemplate}>
                  CSV 模板
                </Button>
              </div>
            </div>
            <Upload
              type="dragAndDrop"
              accept=".csv,text/csv"
              maxCount={1}
              showUploadList={false}
              customRequest={uploadRequest}
              disabled={importing}
              className="bg-[var(--color-bg-container)]"
            >
              <div className="flex flex-col items-center gap-8 py-24">
                <InboxOutlined className="text-[40px] text-[var(--color-primary)]" />
                <div className="text-base font-normal text-[var(--color-text)]">点击或拖拽 CSV 文件到此区域上传</div>
                <div className="text-base font-normal text-[var(--color-text-secondary)]">仅支持 .csv 文件，系统将校验缺项与规则分类范围</div>
                {importing ? <div className="text-base text-[var(--color-primary)]">校验中...</div> : null}
              </div>
            </Upload>
          </>
        )}
      </div>
    </ModalDialog>
  )
}
