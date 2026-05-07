import { CloudUploadOutlined, DownloadOutlined, FileTextOutlined, InboxOutlined } from '@ant-design/icons'
import Upload from '../../../components/data-entry/upload'
import Button from '../../../components/feedback/button'
import type { ImportErrorItem, ImportSummary } from '../../../types/plan'

type UploadDataStepProps = {
  importSummary: ImportSummary | null
  fileName?: string
  uploading?: boolean
  onUploadCsv: (file: File) => Promise<ImportSummary | null>
  onBackToBasic: () => void
  onFinish: () => void
}

type SummaryTone = 'default' | 'success' | 'warning' | 'error' | 'muted'
type SummaryFill = 'default' | 'success' | 'warning' | 'error'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function downloadCsvTemplate() {
  const headers = ['住院号', '病历内容', '智能体A输出', '智能体B输出']
  const csv = `\uFEFF${headers.join(',')}\n`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '标注计划数据模板.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function SummaryTile({
  label,
  value,
  fill = 'default',
  tone = fill
}: {
  label: string
  value: number
  fill?: SummaryFill
  tone?: SummaryTone
}) {
  const toneClass: Record<SummaryTone, string> = {
    default: 'text-[var(--color-text)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    error: 'text-[var(--color-error)]',
    muted: 'text-[var(--color-text-secondary)]'
  }
  const fillClass: Record<SummaryFill, string> = {
    default: 'bg-[var(--color-gray-2)]',
    success: 'bg-[var(--color-green-1)]',
    warning: 'bg-[var(--color-warning-bg)]',
    error: 'bg-[var(--color-error-bg)]'
  }

  return (
    <div className={cx('flex min-h-[76px] flex-col gap-4 rounded-md p-12', fillClass[fill])}>
      <div className="text-caption font-normal text-[var(--color-text-secondary)]">{label}</div>
      <div className={cx('text-heading-4 font-semibold leading-heading-4', toneClass[tone])}>{value}</div>
    </div>
  )
}

function ImportResult({ summary }: { summary: ImportSummary }) {
  const hasError = summary.failed_rows > 0

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
      <SummaryTile label="总行数" value={summary.total_rows} />
      <SummaryTile label="成功" value={summary.success_rows} fill="success" />
      <SummaryTile label="跳过" value={summary.skipped_rows} fill="warning" tone={summary.skipped_rows > 0 ? 'warning' : 'muted'} />
      <SummaryTile label="失败" value={summary.failed_rows} fill="error" tone={hasError ? 'error' : 'muted'} />
    </div>
  )
}

function errorCode(error: ImportErrorItem) {
  if (error.reason.includes('重复')) return 'CSV_DUPLICATE_CASE_ID'
  if (error.reason.includes('解析') || error.reason.includes('引号')) return 'CSV_PARSE_ERROR'
  if (error.reason.includes('缺少字段')) return 'CSV_REQUIRED_COLUMN_MISSING'
  if (error.reason.includes('智能体A输出') || error.reason.includes('智能体B输出')) return 'CSV_AGENT_OUTPUT_EMPTY'
  return 'CSV_ROW_EMPTY'
}

function errorMessage(error: ImportErrorItem) {
  const normalizedReason = error.reason.replace(/^缺少字段:\s*/, '缺少字段：')
  return `第 ${error.row_number} 行${normalizedReason}`
}

function ErrorSummary({ errors }: { errors: ImportErrorItem[] }) {
  if (!errors.length) return null

  return (
    <div className="h-[280px] overflow-hidden rounded-md border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)]">
      <div className="flex h-[40px] items-center border-b border-[var(--color-border-secondary)] bg-[var(--color-gray-2)] px-12 text-base font-semibold text-[var(--color-text)]">
        失败原因摘要
      </div>
      <div className="h-[240px] overflow-auto">
        {errors.slice(0, 5).map((error) => (
          <div key={`${error.row_number}-${error.reason}`} className="flex items-center gap-12 px-12 py-12 text-base">
            <span className="shrink-0 rounded-sm border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-8 py-[2px] text-caption font-normal text-[var(--color-error)]">
              {errorCode(error)}
            </span>
            <span className="min-w-0 flex-1 truncate font-normal text-[var(--color-text-secondary)]">{errorMessage(error)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UploadDropzone({ uploading, onUploadCsv }: Pick<UploadDataStepProps, 'uploading' | 'onUploadCsv'>) {
  return (
    <Upload
      type="dragAndDrop"
      accept=".csv,text/csv"
      maxCount={1}
      showUploadList={false}
      disabled={uploading}
      beforeUpload={async (file) => {
        await onUploadCsv(file)
        return false
      }}
      className="[&_.ant-upload-drag]:!border-[var(--color-border)] [&_.ant-upload-drag]:!bg-[var(--color-fill-quaternary)] [&_.ant-upload-drag]:!p-12"
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined className="text-[48px] text-[var(--color-primary)]" />
      </p>
      <p className="ant-upload-text text-body-lg font-normal text-[var(--color-text)]">点击或拖拽 CSV 文件到此区域</p>
      <p className="ant-upload-hint text-base font-normal text-[var(--color-text-secondary)]">
        仅支持单个 .csv 文件，字段需包含住院号、病历内容、智能体A输出、智能体B输出。
      </p>
    </Upload>
  )
}

function FileNote({
  uploaded,
  fileName,
  uploading,
  onUploadCsv
}: {
  uploaded: boolean
  fileName?: string
  uploading?: boolean
  onUploadCsv: (file: File) => Promise<ImportSummary | null>
}) {
  const title = uploaded ? (fileName ?? 'samples.csv') : '数据模板'
  const description = uploaded ? 'CSV 文件上传成功，字段校验通过' : '下载模板，按照模板填写数据后上传'

  return (
    <div className="flex min-h-[58px] items-center justify-between gap-16 border border-[var(--color-border)] bg-[var(--color-bg-container)] p-12">
      <div className="flex min-w-0 items-center gap-16">
        <FileTextOutlined className={cx('text-[18px]', uploaded ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]')} />
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-[var(--color-text)]">{title}</div>
          <div className="truncate text-base font-normal text-[var(--color-text-secondary)]">{description}</div>
        </div>
      </div>
      {uploaded ? (
        <Upload
          accept=".csv,text/csv"
          maxCount={1}
          showUploadList={false}
          disabled={uploading}
          beforeUpload={async (file) => {
            await onUploadCsv(file)
            return false
          }}
        >
          <Button icon={<CloudUploadOutlined />} loading={uploading}>
            重新上传
          </Button>
        </Upload>
      ) : (
        <Button icon={<DownloadOutlined />} onClick={downloadCsvTemplate}>
          下载模板
        </Button>
      )}
    </div>
  )
}

export default function UploadDataStep({ importSummary, fileName, uploading, onUploadCsv, onBackToBasic, onFinish }: UploadDataStepProps) {
  const uploaded = Boolean(importSummary)
  const hasError = (importSummary?.failed_rows ?? 0) > 0

  return (
    <div className="flex h-full flex-col gap-16">
      <div className="text-lg font-semibold text-[var(--color-text)]">上传数据</div>
      {!uploaded ? <UploadDropzone uploading={uploading} onUploadCsv={onUploadCsv} /> : null}
      <FileNote uploaded={uploaded} fileName={fileName} uploading={uploading} onUploadCsv={onUploadCsv} />
      {importSummary ? <ImportResult summary={importSummary} /> : null}
      {hasError && importSummary ? <ErrorSummary errors={importSummary.errors} /> : null}
      <div className="mt-auto flex items-center justify-between gap-8">
        <Button onClick={onBackToBasic}>上一步</Button>
        <Button color="primary" variant="solid" loading={uploading} disabled={!importSummary || uploading} onClick={onFinish}>
          创建计划
        </Button>
      </div>
    </div>
  )
}
