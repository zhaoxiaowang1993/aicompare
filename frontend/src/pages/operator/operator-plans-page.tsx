import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchOperatorPlans } from '../../api/operator'
import type { OperatorPlanListItem } from '../../types/operator'
import OperatorShell from './components/operator-shell'
import PlanList from './components/plan-list'
import { EmptyPlansPanel, ErrorPanel, PlansLoadingPanel } from './components/state-panels'

type PlanListState = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export default function OperatorPlansPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const previewState = searchParams.get('state')
  const [state, setState] = useState<PlanListState>('loading')
  const [items, setItems] = useState<OperatorPlanListItem[]>([])

  const loadPlans = useCallback(async () => {
    if (previewState === 'loading') {
      setState('loading')
      return
    }
    if (previewState === 'error') {
      setItems([])
      setState('error')
      return
    }
    if (previewState === 'empty') {
      setItems([])
      setState('empty')
      return
    }

    setState('loading')
    try {
      const response = await fetchOperatorPlans({ page: 1, page_size: 20 })
      setItems(response.items)
      setState(response.items.length ? 'success' : 'empty')
    } catch {
      setState('error')
    }
  }, [previewState])

  useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  function startPlan(plan: OperatorPlanListItem) {
    if (plan.status === 'closed' || plan.status === 'completed') return
    navigate(`/operator/plans/${plan.id}/annotate`)
  }

  return (
    <OperatorShell>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-16">
        <h1 className="m-0 text-heading-3 font-semibold leading-heading-3 text-text">我的标注计划</h1>
        {state === 'loading' ? <PlansLoadingPanel /> : null}
        {state === 'empty' ? <EmptyPlansPanel /> : null}
        {state === 'error' ? <ErrorPanel title="计划加载失败" description="标注计划加载失败，请稍后重试。" onRetry={() => void loadPlans()} /> : null}
        {state === 'success' ? <PlanList items={items} onStart={startPlan} /> : null}
      </div>
    </OperatorShell>
  )
}
