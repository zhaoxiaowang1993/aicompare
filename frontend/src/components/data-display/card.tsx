// Generated from design/components/data-display-new.lib.pen - Card
import { Card as AntCard } from 'antd'
import type { CardProps as AntCardProps } from 'antd'

export type CardSize = 'medium' | 'small'
export type CardBorder = 'bordered' | 'borderless'
export type CardState = 'default' | 'hover'
export type CardKind = 'card' | 'inner'

export type ComponentProps = Omit<AntCardProps, 'size' | 'bordered' | 'type'> & {
  size?: CardSize
  border?: CardBorder
  state?: CardState
  kind?: CardKind
}
export type CardComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Card({
  size = 'medium',
  border = 'bordered',
  state = 'default',
  kind = 'card',
  className,
  hoverable,
  ...cardProps
}: ComponentProps) {
  const isSmall = size === 'small'
  const isBordered = border === 'bordered'
  const isInner = kind === 'inner'

  return (
    <AntCard
      {...cardProps}
      type={isInner ? 'inner' : undefined}
      size={isSmall ? 'small' : 'medium'}
      variant={isBordered ? 'outlined' : 'borderless'}
      hoverable={hoverable ?? state === 'hover'}
      className={cx(
        'rounded-lg bg-[var(--color-bg-container)]',
        isSmall ? '[&_.ant-card-body]:p-12 [&_.ant-card-head]:min-h-9 [&_.ant-card-head]:px-12' : '[&_.ant-card-body]:p-24',
        !isBordered && 'border-transparent shadow-none',
        state === 'hover' && 'shadow-[var(--shadow-control)]',
        className
      )}
    />
  )
}
