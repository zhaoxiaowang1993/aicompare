import Card from '../../../components/data-display/card'
import Empty from '../../../components/data-display/empty'
import type { Decision, PlanStats } from '../../../types/report'
import type { CSSProperties } from 'react'

type PlanOverviewSectionProps = {
  stats: PlanStats | null
  loading?: boolean
}

type ChartSegment = {
  key: string
  label: string
  count: number
  color: string
}

const decisionText: Record<Decision, string> = {
  A_BETTER: 'A 更好',
  B_BETTER: 'B 更好',
  BOTH_BAD: '都不好',
  BOTH_GOOD: '都好'
}

function percent(count: number, total: number) {
  return total ? Math.round((count / total) * 100) : 0
}

function buildConicGradient(segments: ChartSegment[], total: number) {
  if (total <= 0) return 'var(--color-fill-quaternary)'

  let cursor = 0
  const stops = segments
    .filter((segment) => segment.count > 0)
    .map((segment) => {
      const start = cursor
      cursor += (segment.count / total) * 360
      return `${segment.color} ${start}deg ${cursor}deg`
    })

  return `conic-gradient(${stops.join(', ')})`
}

function LegendItem({ segment, total }: { segment: ChartSegment; total: number }) {
  const value = percent(segment.count, total)

  return (
    <div className="flex items-center gap-8 text-base font-normal">
      <span className="h-[8px] w-[8px] shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
      <span className="min-w-0 flex-1 truncate text-[var(--color-text)]">{segment.label}</span>
      <span className="shrink-0 text-caption font-normal text-[var(--color-text-secondary)]">
        {segment.count}（{value}%）
      </span>
    </div>
  )
}

function OverviewChart({ title, segments, total, loading }: { title: string; segments: ChartSegment[]; total: number; loading?: boolean }) {
  const pieStyle: CSSProperties = {
    background: buildConicGradient(segments, total)
  }
  const hasData = total > 0

  return (
    <Card loading={loading} className="min-h-[288px]">
      <div className="flex flex-col gap-16">
        <div className="text-lg font-semibold text-[var(--color-text)]">{title}</div>
        {hasData ? (
          <div className="flex flex-col gap-24 sm:flex-row sm:items-center">
            <div className="h-[176px] w-[176px] shrink-0 rounded-full" style={pieStyle} aria-label={`${title}饼图`} />
            <div className="flex min-w-0 flex-1 flex-col gap-12">
              {segments.map((segment) => (
                <LegendItem key={segment.key} segment={segment} total={total} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[176px] items-center justify-center text-base font-normal text-[var(--color-text-secondary)]">暂无数据</div>
        )}
      </div>
    </Card>
  )
}

export default function PlanOverviewSection({ stats, loading }: PlanOverviewSectionProps) {
  const decisionTotal = stats ? Object.values(stats.decision_distribution).reduce((sum, count) => sum + count, 0) : 0
  const progressTotal = stats?.total_cases ?? 0
  const progressSegments: ChartSegment[] = [
    { key: 'done', label: '已完成', count: stats?.annotated_cases ?? 0, color: 'var(--color-success)' },
    { key: 'todo', label: '未完成', count: stats?.pending_cases ?? 0, color: 'var(--color-fill-secondary)' }
  ]
  const decisionSegments: ChartSegment[] = [
    { key: 'A_BETTER', label: decisionText.A_BETTER, count: stats?.decision_distribution.A_BETTER ?? 0, color: 'var(--color-primary)' },
    { key: 'B_BETTER', label: decisionText.B_BETTER, count: stats?.decision_distribution.B_BETTER ?? 0, color: 'var(--color-success)' },
    { key: 'BOTH_BAD', label: decisionText.BOTH_BAD, count: stats?.decision_distribution.BOTH_BAD ?? 0, color: 'var(--color-error)' },
    { key: 'BOTH_GOOD', label: decisionText.BOTH_GOOD, count: stats?.decision_distribution.BOTH_GOOD ?? 0, color: 'var(--color-warning)' }
  ]

  if (!stats && !loading) {
    return (
      <Card>
        <Empty imageVariant="simple" description="暂无统计数据" />
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
      <OverviewChart title="完成情况" segments={progressSegments} total={progressTotal} loading={loading} />
      <OverviewChart title="结论分布" segments={decisionSegments} total={decisionTotal} loading={loading} />
    </div>
  )
}
