// Generated from design/components/data-display-new.lib.pen - Tag
import { Tag as AntTag } from 'antd'
import type { TagProps as AntTagProps } from 'antd'
import type { ComponentProps as ReactComponentProps, CSSProperties, ReactNode } from 'react'

export type TagAppearance = 'outlined' | 'solid' | 'filled'
export type TagColor =
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
export type TagMode = 'static' | 'checkable'
export type TagState = 'default' | 'success' | 'processing' | 'error' | 'warning'
export type TagInteractionState = 'default' | 'checked' | 'hover' | 'pressed' | 'hover-checked' | 'pressed-checked'

export type ComponentProps = Omit<AntTagProps, 'color'> & {
  appearance?: TagAppearance
  color?: TagColor
  mode?: TagMode
  state?: TagState
  interactionState?: TagInteractionState
  checked?: boolean
  onCheckedChange?: ReactComponentProps<typeof AntTag.CheckableTag>['onChange']
  icon?: ReactNode
  closeIcon?: ReactNode
}
export type TagComponentProps = ComponentProps

const semanticColorByState: Record<Exclude<TagState, 'default'>, TagColor> = {
  success: 'green',
  processing: 'blue',
  error: 'red',
  warning: 'gold'
}

const palette: Record<TagColor, { text: string; bg: string; border: string; solid: string }> = {
  default: {
    text: 'var(--color-text)',
    bg: 'var(--color-fill-quaternary)',
    border: 'var(--color-border)',
    solid: 'var(--color-text)'
  },
  red: { text: 'var(--color-red-7)', bg: 'var(--color-red-1)', border: 'var(--color-red-3)', solid: 'var(--color-red-6)' },
  volcano: {
    text: 'var(--color-volcano-7)',
    bg: 'var(--color-volcano-1)',
    border: 'var(--color-volcano-3)',
    solid: 'var(--color-volcano-6)'
  },
  orange: {
    text: 'var(--color-orange-7)',
    bg: 'var(--color-orange-1)',
    border: 'var(--color-orange-3)',
    solid: 'var(--color-orange-6)'
  },
  gold: { text: 'var(--color-warning)', bg: 'var(--color-gold-1)', border: 'var(--color-gold-3)', solid: 'var(--color-warning)' },
  yellow: {
    text: 'var(--color-yellow-7)',
    bg: 'var(--color-yellow-1)',
    border: 'var(--color-yellow-3)',
    solid: 'var(--color-yellow-6)'
  },
  lime: { text: 'var(--color-lime-7)', bg: 'var(--color-lime-1)', border: 'var(--color-lime-3)', solid: 'var(--color-lime-6)' },
  green: { text: 'var(--color-success)', bg: 'var(--color-green-1)', border: 'var(--color-green-3)', solid: 'var(--color-success)' },
  cyan: { text: 'var(--color-cyan-7)', bg: 'var(--color-cyan-1)', border: 'var(--color-cyan-3)', solid: 'var(--color-cyan-6)' },
  blue: { text: 'var(--color-primary-active)', bg: 'var(--color-primary-bg)', border: 'var(--color-primary-border)', solid: 'var(--color-primary)' },
  geekblue: {
    text: 'var(--color-geekblue-7)',
    bg: 'var(--color-geekblue-1)',
    border: 'var(--color-geekblue-3)',
    solid: 'var(--color-geekblue-6)'
  },
  purple: {
    text: 'var(--color-purple-7)',
    bg: 'var(--color-purple-1)',
    border: 'var(--color-purple-3)',
    solid: 'var(--color-purple-6)'
  },
  magenta: {
    text: 'var(--color-magenta-7)',
    bg: 'var(--color-magenta-1)',
    border: 'var(--color-magenta-3)',
    solid: 'var(--color-magenta-6)'
  }
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function styleFor(appearance: TagAppearance, color: TagColor): CSSProperties {
  const item = palette[color]

  if (appearance === 'solid') {
    return { color: 'var(--color-bg-container)', backgroundColor: item.solid, borderColor: item.solid }
  }

  if (appearance === 'filled') {
    return { color: item.text, backgroundColor: item.bg, borderColor: 'transparent' }
  }

  return { color: item.text, backgroundColor: item.bg, borderColor: item.border }
}

export default function Tag({
  appearance = 'outlined',
  color = 'default',
  mode = 'static',
  state = 'default',
  interactionState = 'default',
  checked,
  onCheckedChange,
  icon,
  closeIcon,
  children = 'Tag',
  className,
  style,
  ...tagProps
}: ComponentProps) {
  const effectiveColor = state === 'default' ? color : semanticColorByState[state]
  const effectiveChecked =
    checked ?? (interactionState === 'checked' || interactionState === 'hover-checked' || interactionState === 'pressed-checked')
  const mergedStyle = { ...styleFor(appearance, effectiveColor), ...style }

  const classes = cx(
    'inline-flex min-h-[22px] items-center rounded px-[7px] py-0 text-xs leading-normal',
    'transition-colors',
    interactionState === 'hover' && 'bg-[var(--color-fill-secondary)] text-[var(--color-primary)]',
    interactionState === 'pressed' && 'bg-[var(--color-fill-secondary)] text-[var(--color-primary-active)]',
    className
  )

  if (mode === 'checkable') {
    return (
      <AntTag.CheckableTag
        checked={effectiveChecked}
        onChange={onCheckedChange}
        className={classes}
        style={
          effectiveChecked
            ? { color: 'var(--color-bg-container)', backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', ...style }
            : mergedStyle
        }
      >
        {icon}
        {children}
      </AntTag.CheckableTag>
    )
  }

  return (
    <AntTag {...tagProps} icon={icon} closeIcon={closeIcon} className={classes} style={mergedStyle}>
      {children}
    </AntTag>
  )
}
