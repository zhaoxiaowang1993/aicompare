// Generated from design/components/navigation-new.lib.pen - Tabs
import { Tabs as AntTabs } from 'antd'
import type { TabsProps as AntTabsProps } from 'antd'
import type { ReactNode } from 'react'

export type TabsPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TabsSize = 'small' | 'middle' | 'large'
export type TabsCard = true | false
export type TabsCentered = true | false
export type TabsWithContent = true | false
export type TabsItemState = 'default' | 'hover' | 'active'
export type TabsItemCurrent = true | false
export type TabsItemDisabled = true | false
export type TabsAddItem = true | false
export type TabsState =
  | 'CardFalse-CenteredFalse'
  | 'CardFalse-CenteredTrue'
  | 'CardTrue-CenteredFalse'
  | 'CardTrue-CenteredTrue'

export type ComponentProps = Omit<AntTabsProps, 'tabPosition' | 'size' | 'type' | 'centered'> & {
  placement?: TabsPlacement
  size?: TabsSize
  card?: TabsCard
  centered?: TabsCentered
  withContent?: TabsWithContent
  content?: ReactNode
  state?: TabsState
  itemState?: TabsItemState
  current?: TabsItemCurrent
  disabled?: TabsItemDisabled
  addItem?: TabsAddItem
}
export type TabsComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function renderWithContent(placement: TabsPlacement, tabs: ReactNode, content: ReactNode) {
  if (placement === 'bottom') {
    return (
      <div className="flex flex-col gap-8">
        <div>{content}</div>
        {tabs}
      </div>
    )
  }

  if (placement === 'left') {
    return (
      <div className="flex gap-8">
        {tabs}
        <div className="min-w-0 flex-1">{content}</div>
      </div>
    )
  }

  if (placement === 'right') {
    return (
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">{content}</div>
        {tabs}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {tabs}
      <div>{content}</div>
    </div>
  )
}

export default function Tabs({
  placement = 'top',
  size = 'middle',
  card = false,
  centered = false,
  withContent = false,
  content,
  state,
  itemState = 'default',
  current = false,
  disabled = false,
  addItem = false,
  className,
  items,
  ...tabsProps
}: ComponentProps) {
  void state
  void current
  void disabled
  void addItem

  const tabs = (
    <AntTabs
      {...tabsProps}
      items={items}
      tabPosition={placement}
      size={size}
      type={card ? 'card' : 'line'}
      centered={centered}
      className={cx(
        '[&_.ant-tabs-tab]:rounded-t-md',
        itemState === 'hover' && '[&_.ant-tabs-tab]:text-[var(--color-primary-hover)]',
        itemState === 'active' && '[&_.ant-tabs-tab]:text-[var(--color-primary-active)]',
        className
      )}
    />
  )

  return withContent ? renderWithContent(placement, tabs, content) : tabs
}
