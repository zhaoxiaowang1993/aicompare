// Generated from design/components/navigation-new.lib.pen - Breadcrumb
import { Breadcrumb as AntBreadcrumb } from 'antd'
import type { BreadcrumbProps as AntBreadcrumbProps } from 'antd'
import type { ReactNode } from 'react'

export type BreadcrumbSeparatorVariant = 'text' | 'icon'
export type BreadcrumbState = 'default'
export type BreadcrumbItemType = 'link' | 'text'
export type BreadcrumbItemState = 'default' | 'hover' | 'active'

export type ComponentProps = Omit<AntBreadcrumbProps, 'separator'> & {
  separatorVariant?: BreadcrumbSeparatorVariant
  state?: BreadcrumbState
  itemType?: BreadcrumbItemType
  itemState?: BreadcrumbItemState
  separatorText?: ReactNode
  separatorIcon?: ReactNode
}
export type BreadcrumbComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Breadcrumb({
  separatorVariant = 'text',
  state = 'default',
  itemType = 'link',
  itemState = 'default',
  separatorText = '/',
  separatorIcon = '>',
  className,
  ...breadcrumbProps
}: ComponentProps) {
  void state
  void itemType

  return (
    <AntBreadcrumb
      {...breadcrumbProps}
      separator={separatorVariant === 'icon' ? separatorIcon : separatorText}
      className={cx(
        'text-sm',
        '[&_.ant-breadcrumb-link]:text-[var(--color-text-secondary)] [&_.ant-breadcrumb-separator]:text-[var(--color-text-disabled)]',
        itemState === 'hover' && '[&_.ant-breadcrumb-link]:text-[var(--color-primary-hover)]',
        itemState === 'active' && '[&_.ant-breadcrumb-link:last-child]:text-[var(--color-text)]',
        className
      )}
    />
  )
}
