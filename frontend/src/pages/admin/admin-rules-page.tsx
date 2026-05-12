import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useEffect, useState } from 'react'
import AdminShell from './components/admin-shell'
import AdminRulesFilters, { type AdminRulesFilterValue } from './components/admin-rules-filters'
import AdminRulesTable from './components/admin-rules-table'
import PageError from './components/page-error'
import RuleFormModal, { type RuleFormValues } from './components/rule-form-modal'
import RuleImportModal from './components/rule-import-modal'
import Button from '../../components/feedback/button'
import ModalDialog from '../../components/feedback/modal-dialog'
import { createRule, deleteRule, downloadRuleTemplate, fetchRules, importRulesCsv, updateRule, validateRulesCsv } from '../../api/admin-rules'
import type { QualityRule, RuleImportSummary } from '../../types/rules'

const defaultFilter: AdminRulesFilterValue = {
  keyword: '',
  category: undefined
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminRulesPage() {
  const [items, setItems] = useState<QualityRule[]>([])
  const [filter, setFilter] = useState<AdminRulesFilterValue>(defaultFilter)
  const [appliedFilter, setAppliedFilter] = useState<AdminRulesFilterValue>(defaultFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<QualityRule | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importSummary, setImportSummary] = useState<RuleImportSummary | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)

  async function loadRules(nextPage = page, nextPageSize = pageSize, nextFilter = appliedFilter) {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchRules({
        keyword: nextFilter.keyword,
        category: nextFilter.category,
        page: nextPage,
        page_size: nextPageSize
      })
      setItems(response.items)
      setTotal(response.total)
    } catch {
      setError('质控规则加载失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadInitialRules() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchRules({
          keyword: defaultFilter.keyword,
          category: defaultFilter.category,
          page: 1,
          page_size: 10
        })
        setItems(response.items)
        setTotal(response.total)
      } catch {
        setError('质控规则加载失败，请稍后重试。')
      } finally {
        setLoading(false)
      }
    }

    void loadInitialRules()
  }, [])

  function applyFilter() {
    setAppliedFilter(filter)
    setPage(1)
    void loadRules(1, pageSize, filter)
  }

  function resetFilter() {
    setFilter(defaultFilter)
    setAppliedFilter(defaultFilter)
    setPage(1)
    void loadRules(1, pageSize, defaultFilter)
  }

  function openCreateForm() {
    setEditingRule(null)
    setFormMode('create')
  }

  function openEditForm(rule: QualityRule) {
    setEditingRule(rule)
    setFormMode('edit')
  }

  function closeForm() {
    setFormMode(null)
    setEditingRule(null)
  }

  async function submitRule(values: RuleFormValues) {
    setSubmitting(true)
    try {
      if (formMode === 'edit' && editingRule) {
        await updateRule(editingRule.id, values)
        message.success('规则已保存')
      } else {
        await createRule(values)
        message.success('规则已新增')
      }
      closeForm()
      await loadRules(formMode === 'create' ? 1 : page, pageSize, appliedFilter)
      if (formMode === 'create') {
        setPage(1)
      }
    } catch {
      message.error('规则保存失败，请检查填写内容。')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deletingRule) return
    setSubmitting(true)
    try {
      await deleteRule(deletingRule.id)
      message.success('规则已删除')
      setDeletingRule(null)
      await loadRules(page, pageSize, appliedFilter)
    } catch {
      message.error('删除失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  async function downloadTemplate() {
    try {
      const blob = await downloadRuleTemplate()
      downloadBlob(blob, 'quality-rules-template.csv')
    } catch {
      message.error('模板下载失败，请稍后重试。')
    }
  }

  async function validateCsv(file: File) {
    setImporting(true)
    try {
      const response = await validateRulesCsv(file)
      setImportFile(file)
      setImportSummary(response)
      if (response.failed_rows > 0) {
        message.warning('CSV 已校验，存在失败行。')
      }
    } catch {
      message.error('CSV 上传失败，请检查文件格式。')
    } finally {
      setImporting(false)
    }
  }

  async function confirmImportCsv() {
    if (!importFile) return
    setImporting(true)
    try {
      const response = await importRulesCsv(importFile)
      if (response.failed_rows > 0) {
        setImportSummary(response)
        message.warning('CSV 已校验，存在失败行。')
        return
      }
      closeImport()
      message.success('CSV 导入成功')
      await loadRules(1, pageSize, appliedFilter)
      setPage(1)
    } catch {
      message.error('CSV 导入失败，请检查文件格式。')
    } finally {
      setImporting(false)
    }
  }

  function openImport() {
    setImportSummary(null)
    setImportFile(null)
    setImportOpen(true)
  }

  function closeImport() {
    setImportOpen(false)
    setImportSummary(null)
    setImportFile(null)
  }

  return (
    <AdminShell activeKey="rules">
      <div className="flex flex-col gap-16 pb-24">
        <div className="flex items-center justify-between gap-16">
          <h1 className="m-0 text-heading-3 font-semibold leading-heading-3">质控规则</h1>
          <div className="flex items-center gap-8">
            <Button className="w-[96px]" icon={<UploadOutlined />} onClick={openImport}>
              批量创建
            </Button>
            <Button className="w-[96px]" color="primary" variant="solid" icon={<PlusOutlined />} onClick={openCreateForm}>
              新增规则
            </Button>
          </div>
        </div>
        <AdminRulesFilters value={filter} loading={loading} onChange={setFilter} onSearch={applyFilter} onReset={resetFilter} />
        {error ? <PageError message={error} onRetry={() => loadRules(page, pageSize, appliedFilter)} /> : null}
        <AdminRulesTable
          items={items}
          loading={loading}
          onEdit={openEditForm}
          onDelete={setDeletingRule}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            showTotal: (count) => `共 ${count} 条`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
              void loadRules(nextPage, nextPageSize, appliedFilter)
            }
          }}
        />
      </div>
      <RuleFormModal
        open={formMode !== null}
        mode={formMode ?? 'create'}
        rule={editingRule}
        submitting={submitting}
        onCancel={closeForm}
        onSubmit={submitRule}
      />
      <RuleImportModal
        open={importOpen}
        importing={importing}
        summary={importSummary}
        fileName={importFile?.name}
        onCancel={closeImport}
        onDownloadTemplate={downloadTemplate}
        onValidate={validateCsv}
        onConfirmImport={confirmImportCsv}
        onReset={() => {
          setImportSummary(null)
          setImportFile(null)
        }}
      />
      <ModalDialog
        open={Boolean(deletingRule)}
        kind="dialog"
        centered
        title={null}
        footerContentType="slot"
        onCancel={() => setDeletingRule(null)}
        footerSlot={
          <div className="flex justify-end gap-8">
            <Button onClick={() => setDeletingRule(null)}>取消</Button>
            <Button color="danger" variant="solid" loading={submitting} onClick={confirmDelete}>
              删除
            </Button>
          </div>
        }
      >
        <div className="flex gap-12 py-8">
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)]">!</div>
          <div className="flex flex-col gap-8">
            <div className="text-heading-5 font-semibold leading-heading-5 text-[var(--color-text)]">确认删除该质控规则？</div>
            <div className="text-base font-normal text-[var(--color-text-secondary)]">删除后该规则会立即从列表中消失。</div>
          </div>
        </div>
      </ModalDialog>
    </AdminShell>
  )
}
