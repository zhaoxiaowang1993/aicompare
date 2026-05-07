import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import AdminShell from './components/admin-shell'
import CreatePlanWorkflow, { type CreatePlanStep } from './components/create-plan-workflow'
import MetricCard from './components/metric-card'
import PageError from './components/page-error'
import PlanListFilters from './components/plan-list-filters'
import PlanListTable from './components/plan-list-table'
import Button from '../../components/feedback/button'
import { createPlanWithImport, fetchOwners, fetchPlans, importPlanCsv, updatePlan } from '../../api/admin-plans'
import type { CreatePlanPayload, ImportSummary, OperatorOption, PlanDetail, PlanItem, PlanStatus, PlanSummary } from '../../types/plan'
import type { PlanListFilterValue } from './components/plan-list-filters'

const defaultFilter: PlanListFilterValue = {
  keyword: '',
  status: undefined,
  ownerUserId: undefined
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function buildSummary(items: PlanItem[]): PlanSummary {
  const totalCases = items.reduce((sum, item) => sum + item.total_cases, 0)
  const annotatedCases = items.reduce((sum, item) => sum + item.annotated_cases, 0)
  return {
    activePlans: items.filter((item) => item.status === 'active' && item.total_cases > item.annotated_cases).length,
    totalCases,
    annotatedCases,
    completionRate: totalCases ? Math.round((annotatedCases / totalCases) * 1000) / 10 : 0
  }
}

export default function AdminPlansPage() {
  const [items, setItems] = useState<PlanItem[]>([])
  const [owners, setOwners] = useState<OperatorOption[]>([])
  const [filter, setFilter] = useState<PlanListFilterValue>(defaultFilter)
  const [appliedFilter, setAppliedFilter] = useState<PlanListFilterValue>(defaultFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [ownersLoading, setOwnersLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [createStep, setCreateStep] = useState<CreatePlanStep>('basic')
  const [basicValues, setBasicValues] = useState<CreatePlanPayload | null>(null)
  const [createdPlan, setCreatedPlan] = useState<PlanDetail | null>(null)
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadPlans(nextPage = page, nextPageSize = pageSize, nextFilter = appliedFilter) {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchPlans({
        status: nextFilter.status,
        owner_user_id: nextFilter.ownerUserId,
        page: nextPage,
        page_size: nextPageSize
      })
      setItems(response.data.items)
      setTotal(response.data.total)
    } catch {
      setError('标注计划加载失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  async function loadOwners() {
    setOwnersLoading(true)
    try {
      const response = await fetchOwners()
      setOwners(response.data)
    } finally {
      setOwnersLoading(false)
    }
  }

  useEffect(() => {
    loadOwners()
    loadPlans(1, pageSize, appliedFilter)
  }, [])

  const visibleItems = useMemo(() => {
    const keyword = appliedFilter.keyword.trim().toLowerCase()
    if (!keyword) return items
    return items.filter((item) => item.name.toLowerCase().includes(keyword) || item.owner_username?.toLowerCase().includes(keyword))
  }, [items, appliedFilter.keyword])

  const summary = useMemo(() => buildSummary(items), [items])

  function applyFilter() {
    setAppliedFilter(filter)
    setPage(1)
    loadPlans(1, pageSize, filter)
  }

  function resetFilter() {
    setFilter(defaultFilter)
    setAppliedFilter(defaultFilter)
    setPage(1)
    loadPlans(1, pageSize, defaultFilter)
  }

  function startCreateFlow() {
    setMode('create')
    setCreateStep('basic')
    setBasicValues(null)
    setCreatedPlan(null)
    setImportSummary(null)
  }

  function leaveCreateFlow() {
    setMode('list')
    setCreateStep('basic')
    setBasicValues(null)
    setCreatedPlan(null)
    setImportSummary(null)
  }

  async function handleCreateBasic(values: CreatePlanPayload) {
    setCreating(true)
    try {
      setBasicValues(values)
      setCreateStep('upload')
      message.success('基础信息已保存')
    } catch {
      message.error('基础信息保存失败，请检查填写内容。')
    } finally {
      setCreating(false)
    }
  }

  async function handleUploadCsv(file: File) {
    if (!basicValues && !createdPlan) return null
    setUploading(true)
    try {
      const response = createdPlan ? await importPlanCsv(createdPlan.id, file) : await createPlanWithImport(basicValues as CreatePlanPayload, file)
      const summary = 'import_summary' in response.data ? response.data.import_summary : response.data
      if ('plan' in response.data) {
        setCreatedPlan(response.data.plan)
      }
      setImportSummary(summary)
      if (summary.failed_rows > 0) {
        message.warning('CSV 已上传，存在失败行。')
      } else {
        message.success('CSV 导入成功')
      }
      return summary
    } catch {
      message.error('CSV 上传失败，请检查文件格式。')
      return null
    } finally {
      setUploading(false)
    }
  }

  async function finishCreateFlow() {
    leaveCreateFlow()
    setPage(1)
    await loadPlans(1, pageSize, appliedFilter)
  }

  async function changeStatus(plan: PlanItem, status: PlanStatus) {
    await updatePlan(plan.id, { status })
    message.success(status === 'closed' ? '计划已关闭' : '重启成功')
    await loadPlans(page, pageSize, appliedFilter)
  }

  return (
    <AdminShell activeKey="plans">
      {mode === 'create' ? (
        <CreatePlanWorkflow
          step={createStep}
          owners={owners}
          basicValues={basicValues}
          importSummary={importSummary}
          creating={creating}
          uploading={uploading}
          onCreateBasic={handleCreateBasic}
          onUploadCsv={handleUploadCsv}
          onBackToBasic={() => setCreateStep('basic')}
          onCancel={leaveCreateFlow}
          onFinish={finishCreateFlow}
        />
      ) : (
        <div className="flex flex-col gap-16 pb-24">
          <div className="flex items-center justify-between">
            <h1 className="m-0 text-heading-3 font-semibold leading-heading-3">标注计划</h1>
            <Button color="primary" variant="solid" onClick={startCreateFlow}>
              新建计划
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
            <MetricCard label="进行中计划" value={summary.activePlans} />
            <MetricCard label="总样本量" value={formatNumber(summary.totalCases)} tone="warning" />
            <MetricCard label="已完成样本" value={formatNumber(summary.annotatedCases)} tone="primary" />
            <MetricCard label="平均完成率" value={`${summary.completionRate}%`} />
          </div>
          <PlanListFilters
            value={filter}
            owners={owners}
            loading={loading || ownersLoading}
            onChange={setFilter}
            onSearch={applyFilter}
            onReset={resetFilter}
          />
          {error ? <PageError message={error} onRetry={() => loadPlans(page, pageSize, appliedFilter)} /> : null}
          <PlanListTable
            items={visibleItems}
            loading={loading}
            onActivate={(plan) => changeStatus(plan, 'active')}
            onClose={(plan) => changeStatus(plan, 'closed')}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              showTotal: (count) => `共 ${count} 条`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
                loadPlans(nextPage, nextPageSize, appliedFilter)
              }
            }}
          />
        </div>
      )}
    </AdminShell>
  )
}
