import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import type { AnnotationDetail, AnnotationListParams, ManualCaseAnnotationSummary, PlanStats } from '../../types/report'

function tabFromSearch(searchParams: URLSearchParams): PlanDetailTabKey {
  const tab = searchParams.get('tab')
  return tab === 'annotations' || tab === 'settings' ? tab : 'overview'
}

function annotationParamsFromSearch(searchParams: URLSearchParams): AnnotationListParams {
  const operatorUserId = Number(searchParams.get('operator_user_id'))
  return {
    operator_user_id: Number.isFinite(operatorUserId) && operatorUserId > 0 ? operatorUserId : undefined,
    decision: (searchParams.get('decision') as AnnotationListParams['decision']) || undefined,
    result: (searchParams.get('result') as AnnotationListParams['result']) || undefined,
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined
  }
}

function pageFromSearch(searchParams: URLSearchParams, key: string, fallback: number) {
  const value = Number(searchParams.get(key))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export default function AdminPlanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const planId = Number(id)
  const [activeTab, setActiveTab] = useState<PlanDetailTabKey>(() => tabFromSearch(searchParams))
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [stats, setStats] = useState<PlanStats | null>(null)
  const [annotations, setAnnotations] = useState<Array<AnnotationDetail | ManualCaseAnnotationSummary>>([])
  const [annotationTotal, setAnnotationTotal] = useState(0)
  const [annotationParams, setAnnotationParams] = useState<AnnotationListParams>(() => annotationParamsFromSearch(searchParams))
  const [page, setPage] = useState(() => pageFromSearch(searchParams, 'page', 1))
  const [pageSize, setPageSize] = useState(() => pageFromSearch(searchParams, 'page_size', 10))
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
      await loadPlan()
      await Promise.all([loadOverview(annotationParams), loadAnnotations(page, pageSize, annotationParams)])
    } catch {
      setError('计划详情加载失败，请确认计划存在后重试。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [planId])

  function writeUrlState(tab: PlanDetailTabKey, params = annotationParams, nextPage = page, nextPageSize = pageSize) {
    const next = new URLSearchParams()
    if (tab !== 'overview') {
      next.set('tab', tab)
    }
    if (params.operator_user_id) next.set('operator_user_id', String(params.operator_user_id))
    if (params.decision) next.set('decision', params.decision)
    if (params.result) next.set('result', params.result)
    if (params.start_date) next.set('start_date', params.start_date)
    if (params.end_date) next.set('end_date', params.end_date)
    if (nextPage !== 1) next.set('page', String(nextPage))
    if (nextPageSize !== 10) next.set('page_size', String(nextPageSize))
    setSearchParams(next, { replace: true })
  }

  function handleTabChange(tab: PlanDetailTabKey) {
    setActiveTab(tab)
    writeUrlState(tab)
  }

  async function handleFilter(value: AnnotationFilterValue) {
    const nextParams: AnnotationListParams = {
      operator_user_id: value.operator_user_id,
      decision: value.decision,
      result: value.result,
      start_date: value.range?.[0]?.format('YYYY-MM-DD'),
      end_date: value.range?.[1]?.format('YYYY-MM-DD')
    }
    setAnnotationParams(nextParams)
    setPage(1)
    writeUrlState('annotations', nextParams, 1, pageSize)
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
    writeUrlState('annotations', annotationParams, nextPage, nextPageSize)
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
        <PlanDetailHeader plan={plan} activeTab={activeTab} onTabChange={handleTabChange} />
        {error ? <PageError message={error} onRetry={loadAll} /> : null}
        {activeTab === 'overview' ? <PlanOverviewSection stats={stats} loading={loading} /> : null}
        {activeTab === 'annotations' ? (
          <AnnotationDetailSection
            annotationType={plan?.annotation_type ?? 'comparison'}
            annotations={annotations}
            total={annotationTotal}
            page={page}
            pageSize={pageSize}
            loading={loading}
            value={{
              operator_user_id: annotationParams.operator_user_id,
              decision: annotationParams.decision,
              result: annotationParams.result,
              range:
                annotationParams.start_date && annotationParams.end_date
                  ? [dayjs(annotationParams.start_date), dayjs(annotationParams.end_date)]
                  : undefined
            }}
            onFilter={handleFilter}
            onPageChange={handlePageChange}
            onOpenManualDetail={(record) =>
              navigate(
                `/admin/plans/${planId}/annotations/${record.manual_annotation_id}?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`
              )
            }
          />
        ) : null}
        {activeTab === 'settings' && plan ? (
          <PlanSettingsSection plan={plan} saving={saving} onSave={handleSave} onStatusChange={handleStatusChange} />
        ) : null}
      </div>
    </AdminShell>
  )
}
