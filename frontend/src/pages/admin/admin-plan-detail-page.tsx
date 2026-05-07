import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import AdminShell from './components/admin-shell'
import AnnotationDetailSection, { type AnnotationFilterValue } from './components/annotation-detail-section'
import PageError from './components/page-error'
import PlanDetailHeader from './components/plan-detail-header'
import type { PlanDetailTabKey } from './components/plan-detail-tabs'
import PlanOverviewSection from './components/plan-overview-section'
import PlanSettingsSection from './components/plan-settings-section'
import { fetchPlan, fetchPlanAnnotations, fetchPlanStats, updatePlan } from '../../api/admin-plans'
import type { PlanDetail, PlanStatus, UpdatePlanPayload } from '../../types/plan'
import type { AnnotationDetail, AnnotationListParams, PlanStats } from '../../types/report'

export default function AdminPlanDetailPage() {
  const { id } = useParams()
  const planId = Number(id)
  const [activeTab, setActiveTab] = useState<PlanDetailTabKey>('overview')
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [stats, setStats] = useState<PlanStats | null>(null)
  const [annotations, setAnnotations] = useState<AnnotationDetail[]>([])
  const [annotationTotal, setAnnotationTotal] = useState(0)
  const [annotationParams, setAnnotationParams] = useState<AnnotationListParams>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPlan() {
    const response = await fetchPlan(planId)
    setPlan(response.data)
  }

  async function loadOverview(params = annotationParams) {
    const response = await fetchPlanStats(planId, params)
    setStats(response.data)
  }

  async function loadAnnotations(nextPage = page, nextPageSize = pageSize, params = annotationParams) {
    const response = await fetchPlanAnnotations(planId, { ...params, page: nextPage, page_size: nextPageSize })
    setAnnotations(response.data.items)
    setAnnotationTotal(response.data.total)
  }

  async function loadAll() {
    if (!planId) return
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadPlan(), loadOverview(), loadAnnotations(1, pageSize)])
    } catch {
      setError('计划详情加载失败，请确认计划存在后重试。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [planId])

  async function handleFilter(value: AnnotationFilterValue) {
    const nextParams: AnnotationListParams = {
      operator_user_id: value.operator_user_id,
      decision: value.decision,
      start_date: value.range?.[0]?.format('YYYY-MM-DD'),
      end_date: value.range?.[1]?.format('YYYY-MM-DD')
    }
    setAnnotationParams(nextParams)
    setPage(1)
    setLoading(true)
    try {
      await Promise.all([loadOverview(nextParams), loadAnnotations(1, pageSize, nextParams)])
    } finally {
      setLoading(false)
    }
  }

  async function handlePageChange(nextPage: number, nextPageSize: number) {
    setPage(nextPage)
    setPageSize(nextPageSize)
    setLoading(true)
    try {
      await loadAnnotations(nextPage, nextPageSize, annotationParams)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(values: UpdatePlanPayload) {
    setSaving(true)
    try {
      await updatePlan(planId, values)
      message.success('计划设置已保存')
      await loadPlan()
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status: PlanStatus) {
    await updatePlan(planId, { status })
    message.success(status === 'closed' ? '计划已关闭' : '计划已重启')
    await loadPlan()
  }

  return (
    <AdminShell activeKey="plans">
      <div className="flex flex-col gap-16">
        <PlanDetailHeader plan={plan} activeTab={activeTab} onTabChange={setActiveTab} />
        {error ? <PageError message={error} onRetry={loadAll} /> : null}
        {activeTab === 'overview' ? <PlanOverviewSection stats={stats} loading={loading} /> : null}
        {activeTab === 'annotations' ? (
          <AnnotationDetailSection
            annotations={annotations}
            total={annotationTotal}
            page={page}
            pageSize={pageSize}
            loading={loading}
            onFilter={handleFilter}
            onPageChange={handlePageChange}
          />
        ) : null}
        {activeTab === 'settings' && plan ? (
          <PlanSettingsSection plan={plan} saving={saving} onSave={handleSave} onStatusChange={handleStatusChange} />
        ) : null}
      </div>
    </AdminShell>
  )
}
