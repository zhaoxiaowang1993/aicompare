import Tag from '../../../components/data-display/tag'
import type { PlanAnnotationType } from '../../../types/plan'

const typeConfig: Record<PlanAnnotationType, { label: string; color: 'blue' | 'green' }> = {
  comparison: { label: '对比模式', color: 'blue' },
  manual: { label: '手动模式', color: 'green' }
}

export default function PlanTypeTag({ type }: { type: PlanAnnotationType }) {
  const config = typeConfig[type]
  return (
    <Tag appearance="filled" color={config.color} className="m-0">
      {config.label}
    </Tag>
  )
}

export function planTypeLabel(type: PlanAnnotationType) {
  return typeConfig[type].label
}
