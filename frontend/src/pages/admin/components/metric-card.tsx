import Card from '../../../components/data-display/card'

type MetricTone = 'default' | 'primary' | 'warning'

type MetricCardProps = {
  label: string
  value: string | number
  tone?: MetricTone
}

const toneClass: Record<MetricTone, string> = {
  default: 'text-[var(--color-text)]',
  primary: 'text-[var(--color-primary)]',
  warning: 'text-[var(--color-warning)]'
}

export default function MetricCard({ label, value, tone = 'default' }: MetricCardProps) {
  return (
    <Card className="min-h-[104px] [&_.ant-card-body]:p-16">
      <div className="flex flex-col gap-8">
        <div className="text-base font-normal text-[var(--color-text-secondary)]">{label}</div>
        <div className={`text-heading-3 font-semibold leading-heading-3 ${toneClass[tone]}`}>{value}</div>
      </div>
    </Card>
  )
}
