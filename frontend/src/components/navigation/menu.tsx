// Generated from design/components/navigation-new.lib.pen - Menu
import { Menu as AntMenu } from 'antd'
import type { MenuProps as AntMenuProps } from 'antd'

export type MenuTheme = 'light' | 'dark'
export type MenuMode = 'vertical' | 'inline' | 'horizontal'
export type MenuState = 'default'
export type MenuItemState = 'default' | 'hover' | 'active'
export type MenuItemCurrent = true | false
export type MenuItemCurrentSub = true | false
export type MenuItemDanger = true | false
export type MenuItemInline = true | false
export type MenuItemDisabled = true | false
export type MenuExtraType = 'text' | 'icon' | 'tag' | 'slot'
export type MenuPopupType = 'list' | 'group'
export type SubmenuArrowState = 'default' | 'current' | 'disabled'
export type MenuOpen = true | false

export type ComponentProps = Omit<AntMenuProps, 'theme' | 'mode' | 'disabled'> & {
  theme?: MenuTheme
  mode?: MenuMode
  state?: MenuState
  itemState?: MenuItemState
  current?: MenuItemCurrent
  currentSub?: MenuItemCurrentSub
  danger?: MenuItemDanger
  inline?: MenuItemInline
  disabled?: MenuItemDisabled
  extraType?: MenuExtraType
  popupType?: MenuPopupType
  submenuArrowState?: SubmenuArrowState
  open?: MenuOpen
}
export type MenuComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Menu({
  theme = 'light',
  mode = 'vertical',
  state = 'default',
  itemState = 'default',
  current = false,
  currentSub = false,
  danger = false,
  inline = mode === 'inline',
  disabled = false,
  extraType = 'text',
  popupType = 'list',
  submenuArrowState = 'default',
  open = false,
  className,
  selectedKeys,
  openKeys,
  ...menuProps
}: ComponentProps) {
  void state
  void extraType
  void popupType
  void submenuArrowState

  return (
    <AntMenu
      {...menuProps}
      theme={theme}
      mode={mode}
      disabled={disabled}
      selectedKeys={selectedKeys ?? (current ? ['current'] : undefined)}
      openKeys={openKeys ?? (open || currentSub ? ['sub'] : undefined)}
      className={cx(
        'rounded-md border-0',
        inline && '[&_.ant-menu-item]:my-1',
        itemState === 'hover' && '[&_.ant-menu-item]:text-[var(--color-primary-hover)]',
        itemState === 'active' && '[&_.ant-menu-item]:text-[var(--color-primary-active)]',
        danger && '[&_.ant-menu-item]:text-[var(--color-error)]',
        className
      )}
    />
  )
}
