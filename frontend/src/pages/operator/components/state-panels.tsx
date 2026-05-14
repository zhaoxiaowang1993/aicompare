import { LoadingOutlined } from '@ant-design/icons'
import { Skeleton } from 'antd'
import Button from '../../../components/feedback/button'
import Empty from '../../../components/data-display/empty'
import Result from '../../../components/feedback/result'

type StatePanelProps = {
  title?: string
  description?: string
  onRetry?: () => void
  onBack?: () => void
}

export function PlansLoadingPanel() {
  return (
    <div className="rounded-lg border border-border-secondary bg-bg-container p-24">
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: 280 }} className="mb-16" />
      <div className="flex flex-col gap-12">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-lg border border-border-secondary p-16">
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '42%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmptyPlansPanel() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-border-secondary bg-bg-container">
      <Empty imageVariant="blueSimple" description="暂无负责的标注计划" />
    </div>
  )
}

export function ErrorPanel({ title = '加载失败', description = '数据加载失败，请稍后重试。', onRetry, onBack }: StatePanelProps) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-border-secondary bg-bg-container p-24">
      <Result
        status="error"
        title={title}
        subTitle={description}
        extraContentType="slot"
        extraSlot={
          <div className="flex items-center justify-center gap-12">
            {onRetry ? (
              <Button color="primary" variant="solid" onClick={onRetry}>
                重试
              </Button>
            ) : null}
            {onBack ? <Button onClick={onBack}>返回列表</Button> : null}
          </div>
        }
      />
    </div>
  )
}

export function WorkbenchLoadingPanel() {
  return (
    <div className="grid h-[calc(100vh-160px)] min-h-[620px] grid-cols-3 gap-16">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-lg border border-border-secondary bg-bg-container p-20">
          <Skeleton active paragraph={{ rows: 12 }} title={{ width: index === 0 ? '45%' : '36%' }} />
        </div>
      ))}
    </div>
  )
}

export function WorkbenchResultPanel({ kind, onRetry, onBack }: { kind: 'complete' | 'error' | 'forbidden' | 'closed'; onRetry?: () => void; onBack: () => void }) {
  const config = {
    complete: {
      status: 'success' as const,
      title: '计划已完成',
      subTitle: '当前计划下的标注任务已经全部完成。'
    },
    error: {
      status: 'error' as const,
      title: '任务加载失败',
      subTitle: '标注任务加载失败，请稍后重试。'
    },
    forbidden: {
      status: '403' as const,
      title: '无权限访问',
      subTitle: '当前账号无权访问该标注计划。'
    },
    closed: {
      status: 'warning' as const,
      title: '计划已关闭',
      subTitle: '该计划已关闭，无法进入标注面板。'
    }
  }[kind]

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center rounded-lg border border-border-secondary bg-bg-container p-24">
      <Result
        status={config.status}
        title={config.title}
        subTitle={config.subTitle}
        extraContentType="slot"
        extraSlot={
          <div className="flex items-center justify-center gap-12">
            {kind === 'error' && onRetry ? (
              <Button color="primary" variant="solid" onClick={onRetry}>
                重试
              </Button>
            ) : null}
            <Button onClick={onBack}>{kind === 'complete' ? '返回计划列表' : '返回列表'}</Button>
          </div>
        }
      />
    </div>
  )
}

export function InlineLoading({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-8 text-text-secondary">
      <LoadingOutlined aria-hidden="true" />
      {label}
    </span>
  )
}
