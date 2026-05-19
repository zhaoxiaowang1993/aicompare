import Tag from '../../../components/data-display/tag'
import type { OperatorPlanAnnotationType } from '../../../types/operator'

export default function OperatorPlanTypeTag({ type }: { type: OperatorPlanAnnotationType }) {
  return (
    <Tag appearance="filled" color={type === 'manual' ? 'green' : 'blue'} className="m-0">
      {type === 'manual' ? '手动模式' : '对比模式'}
    </Tag>
  )
}
