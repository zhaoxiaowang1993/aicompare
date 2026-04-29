// Generated from design/components/data-display-new.lib.pen - Badge
import { Badge as AntBadge } from 'antd'
import type { BadgeProps as AntBadgeProps } from 'antd'
import type { ComponentProps as ReactComponentProps, CSSProperties, ReactNode } from 'react'

export type BadgeVariant = 'count' | 'dot' | 'icon' | 'ribbon'
export type BadgeColor =
  | 'default'
  | 'red'
  | 'volcano'
  | 'orange'
  | 'gold'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'geekblue'
  | 'purple'
  | 'magenta'
export type BadgePlacement = 'start' | 'end'
export type BadgeState = 'default'
export type BadgeDotState = 'default' | 'progressing'

export type ComponentProps = Omit<AntBadgeProps, 'color' | 'count' | 'dot' | 'status' | 'text'> & {
  variant?: BadgeVariant
  color?: BadgeColor
  state?: BadgeState
  dotState?: BadgeDotState
  placement?: BadgePlacement
  count?: ReactNode
  text?: ReactNode
  icon?: ReactNode
  ribbonText?: ReactNode
  children?: ReactNode
  ribbonProps?: Omit<ReactComponentProps<typeof AntBadge.Ribbon>, 'color' | 'placement' | 'text'>
}
export type BadgeComponentProps = ComponentProps

const colorClassByName: Record<BadgeColor, string> = {
  default: 'bg-[var(--color-primary)] text-[var(--color-primary)]',
  red: 'bg-[var(--color-red-6)] text-[var(--color-red-6)]',
  volcano: 'bg-[var(--color-volcano-6)] text-[var(--color-volcano-6)]',
  orange: 'bg-[var(--color-orange-6)] text-[var(--color-orange-6)]',
  gold: 'bg-[var(--color-warning)] text-[var(--color-warning)]',
  yellow: 'bg-[var(--color-yellow-6)] text-[var(--color-yellow-6)]',
  lime: 'bg-[var(--color-lime-6)] text-[var(--color-lime-6)]',
  green: 'bg-[var(--color-success)] text-[var(--color-success)]',
  cyan: 'bg-[var(--color-cyan-6)] text-[var(--color-cyan-6)]',
  blue: 'bg-[var(--color-primary)] text-[var(--color-primary)]',
  geekblue: 'bg-[var(--color-geekblue-6)] text-[var(--color-geekblue-6)]',
  purple: 'bg-[var(--color-purple-6)] text-[var(--color-purple-6)]',
  magenta: 'bg-[var(--color-magenta-6)] text-[var(--color-magenta-6)]'
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function renderIconBadge(icon: ReactNode, color: BadgeColor, className?: string, style?: CSSProperties) {
  return (
    <span
      className={cx('inline-flex h-3.5 w-3.5 items-center justify-center leading-none', colorClassByName[color], className)}
      style={style}
    >
      {icon}
    </span>
  )
}

export default function Badge({
  variant = 'count',
  color = 'default',
  state = 'default',
  dotState = 'default',
  placement = 'end',
  count,
  text,
  icon,
  ribbonText,
  children,
  className,
  style,
  ribbonProps,
  ...badgeProps
}: ComponentProps) {
  void state

  if (variant === 'ribbon') {
    return (
      <AntBadge.Ribbon
        {...ribbonProps}
        text={ribbonText ?? text ?? count}
        placement={placement}
        color={`var(--color-${color === 'default' || color === 'blue' ? 'primary' : `${color}-6`})`}
        className={cx('rounded-t-[4px] text-sm leading-normal', ribbonProps?.className)}
      >
        {children}
      </AntBadge.Ribbon>
    )
  }

  if (variant === 'icon') {
    return renderIconBadge(icon ?? count, color, className, style)
  }

  return (
    <AntBadge
      {...badgeProps}
      dot={variant === 'dot'}
      count={variant === 'count' ? count : undefined}
      color={`var(--color-${color === 'default' || color === 'blue' ? 'error' : `${color}-6`})`}
      text={variant === 'dot' ? text : undefined}
      className={cx(
        '[&_.ant-badge-count]:min-w-5 [&_.ant-badge-count]:rounded-[10px] [&_.ant-badge-count]:px-1.5',
        '[&_.ant-badge-dot]:h-1.5 [&_.ant-badge-dot]:w-1.5',
        dotState === 'progressing' && '[&_.ant-badge-dot]:animate-pulse',
        className
      )}
      style={style}
    >
      {children}
    </AntBadge>
  )
}
