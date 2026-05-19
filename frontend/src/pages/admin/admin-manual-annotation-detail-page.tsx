import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './components/admin-shell'
import PageError from './components/page-error'
import Tag from '../../components/data-display/tag'
import Table from '../../components/data-display/table'
import Empty from '../../components/data-display/empty'
import Button from '../../components/feedback/button'
import { fetchManualAnnotationDetail } from '../../api/admin-plans'
import ManualAnnotationLayout, { type ManualLayoutEntry } from '../shared/manual-annotation-layout'
import type { ManualAnnotationDetail } from '../../types/report'

type ViewMode = 'workbench' | 'list'
type DetailState = 'loading' | 'success' | 'error'

function formatTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false
  })
}

function resultTag(detail: ManualAnnotationDetail) {
  if (detail.result === 'no_issue') {
    return (
      <Tag appearance="outlined" color="green" className="m-0">
        无问题
      </Tag>
    )
  }
  return (
    <Tag appearance="outlined" color="red" className="m-0">
      有问题 {detail.entries.length}
    </Tag>
  )
}

export default function AdminManualAnnotationDetailPage() {
  const { id, manualAnnotationId } = useParams()
  const navigate = useNavigate()
  const planId = Number(id)
  const annotationId = Number(manualAnnotationId)
  const [state, setState] = useState<DetailState>('loading')
  const [detail, setDetail] = useState<ManualAnnotationDetail | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('workbench')

  const loadDetail = useCallback(async () => {
    if (!planId || !annotationId) {
      setState('error')
      return
    }
    setState('loading')
    try {
      const response = await fetchManualAnnotationDetail(planId, annotationId)
      setDetail(response.data)
      setState('success')
    } catch {
      setState('error')
    }
  }, [annotationId, planId])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const entries = useMemo<ManualLayoutEntry[]>(() => {
    return (
      detail?.entries.map((entry, index) => ({
        id: String(index + 1),
        sourceText: entry.source_text,
        startOffset: entry.start_offset,
        endOffset: entry.end_offset,
        qualityRuleId: String(entry.quality_rule.id),
        qualityRuleTitle: entry.quality_rule.category,
        qualityRuleContent: entry.quality_rule.content,
        qualityRuleScore: entry.quality_rule.score,
        suggestion: entry.suggestion,
        notes: entry.notes,
        createdAt: entry.created_at
      })) ?? []
    )
  }, [detail])

  return (
    <AdminShell activeKey="plans">
      <div className="flex h-[calc(100vh-112px)] min-h-[760px] flex-col gap-16">
        <div className="flex flex-col gap-12">
          <div className="text-caption font-normal text-[var(--color-text-secondary)]">
            <Link to="/admin/plans" className="font-normal text-[var(--color-primary)]">
              标注计划
            </Link>
            <span className="mx-8">/</span>
            <Link to={`/admin/plans/${planId}`} className="font-normal text-[var(--color-primary)]">
              计划详情
            </Link>
            <span className="mx-8">/</span>
            <span>标注详情</span>
          </div>
          <div className="flex items-center justify-between gap-16">
            <div className="flex min-w-0 items-center gap-12">
              <Button variant="link" color="primary" className="p-0" onClick={() => navigate(`/admin/plans/${planId}`)}>
                返回明细
              </Button>
              <h1 className="m-0 truncate text-heading-3 font-semibold leading-heading-3">
                {detail ? `${detail.hospitalization_no} 手动标注详情` : '手动标注详情'}
              </h1>
              {detail ? resultTag(detail) : null}
            </div>
            <div className="text-base font-normal text-[var(--color-text-secondary)]">
              {detail ? `提交时间：${formatTime(detail.submitted_at)}` : null}
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Button color={viewMode === 'workbench' ? 'primary' : 'default'} variant={viewMode === 'workbench' ? 'solid' : 'text'} onClick={() => setViewMode('workbench')}>
              工作台视图
            </Button>
            <Button color={viewMode === 'list' ? 'primary' : 'default'} variant={viewMode === 'list' ? 'solid' : 'text'} onClick={() => setViewMode('list')}>
              列表视图
            </Button>
          </div>
        </div>
        {state === 'error' ? <PageError message="手动标注详情加载失败，请稍后重试。" onRetry={loadDetail} /> : null}
        {state === 'loading' ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] text-base text-[var(--color-text-secondary)]">
            加载中...
          </div>
        ) : null}
        {state === 'success' && detail && viewMode === 'workbench' ? (
          <ManualAnnotationLayout
            readonly
            recordText={detail.record_text}
            hospitalizationNo={detail.hospitalization_no}
            entries={entries}
            rules={[]}
            rightTitle="标注结果"
          />
        ) : null}
        {state === 'success' && detail && viewMode === 'list' ? (
          <Table
            rowKey="entry_id"
            size="middle"
            border="borderless"
            dataSource={detail.entries}
            locale={{ emptyText: <Empty imageVariant="simple" description="暂无质控问题条目" /> }}
            pagination={{
              current: 1,
              pageSize: 10,
              total: detail.entries.length,
              showSizeChanger: false,
              showTotal: (count) => `共 ${count} 条`
            }}
            className="overflow-hidden border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] [&_.ant-pagination]:mb-16 [&_.ant-pagination]:px-16 [&_.ant-pagination-total-text]:font-normal [&_.ant-table-cell]:h-[84px] [&_.ant-table-cell]:text-base [&_.ant-table-cell]:font-normal [&_.ant-table-thead>tr>th]:h-[48px] [&_.ant-table-thead>tr>th]:bg-[var(--color-bg-container)] [&_.ant-table-thead>tr>th]:font-semibold"
            columns={[
              { title: '病历原文', dataIndex: 'source_text', width: 320 },
              { title: '质控规则', dataIndex: ['quality_rule', 'content'], width: 320 },
              { title: '修改建议', dataIndex: 'suggestion', width: 320 },
              { title: '标注时间', dataIndex: 'created_at', width: 190, render: formatTime }
            ]}
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
