// Generated from design/components/feedback-new.lib.pen - Drawer
import { Button, Drawer as AntDrawer, Space } from 'antd'
import type { DrawerProps as AntDrawerProps } from 'antd'
import type { ReactNode } from 'react'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'
export type DrawerSize = 'default' | 'large'
export type DrawerInline = true | false
export type DrawerState = 'InlineFalse' | 'InlineTrue'
export type DrawerMask = true | false
export type DrawerBlur = true | false
export type DrawerBodyPadding = true | false
export type DrawerCloseHover = true | false
export type DrawerExtraContentType = 'button' | 'slot'
export type DrawerFooterContentType = 'default' | 'slot'
export type DrawerDelete = true | false
export type DrawerHeaderPlacement = 'start' | 'end' | 'none'
export type DrawerClosable = true | false
export type DrawerTitleContentType = 'text' | 'slot'

export type ComponentProps = Omit<AntDrawerProps, 'placement' | 'size' | 'getContainer' | 'mask' | 'title' | 'extra' | 'footer'> & {
  placement?: DrawerPlacement
  size?: DrawerSize
  inline?: DrawerInline
  state?: DrawerState
  mask?: DrawerMask
  blur?: DrawerBlur
  bodyPadding?: DrawerBodyPadding
  closeHover?: DrawerCloseHover
  extraContentType?: DrawerExtraContentType
  footerContentType?: DrawerFooterContentType
  deleteAction?: DrawerDelete
  headerPlacement?: DrawerHeaderPlacement
  closable?: DrawerClosable
  titleContentType?: DrawerTitleContentType
  title?: ReactNode
  titleSlot?: ReactNode
  extra?: AntDrawerProps['extra']
  footer?: AntDrawerProps['footer']
  getContainer?: AntDrawerProps['getContainer']
  extraSlot?: ReactNode
  footerSlot?: ReactNode
  okText?: ReactNode
  cancelText?: ReactNode
  deleteText?: ReactNode
}
export type DrawerComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Drawer({
  placement = 'right',
  size = 'default',
  inline = false,
  state,
  mask = true,
  blur = false,
  bodyPadding = true,
  closeHover = false,
  extraContentType,
  footerContentType,
  deleteAction = false,
  headerPlacement = 'end',
  closable = true,
  titleContentType = 'text',
  title = 'Drawer',
  titleSlot,
  extra: drawerExtra,
  footer: drawerFooter,
  getContainer,
  extraSlot,
  footerSlot,
  okText = 'OK',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  className,
  rootClassName,
  children,
  ...drawerProps
}: ComponentProps) {
  void state
  void headerPlacement

  const extra =
    extraContentType === 'slot' ? extraSlot : extraContentType === 'button' ? <Button type="primary">{okText}</Button> : drawerExtra
  const footer =
    footerContentType === 'slot' ? (
      footerSlot
    ) : footerContentType === 'default' ? (
      <div className="flex items-center justify-between">
        {deleteAction ? <Button danger>{deleteText}</Button> : <span />}
        <Space>
          <Button>{cancelText}</Button>
          <Button type="primary">{okText}</Button>
        </Space>
      </div>
    ) : (
      drawerFooter
    )

  return (
    <AntDrawer
      {...drawerProps}
      placement={placement}
      size={size}
      getContainer={inline ? false : getContainer}
      mask={mask}
      closable={closable}
      title={titleContentType === 'slot' ? titleSlot : title}
      extra={extra}
      footer={footer}
      rootClassName={cx(blur && '[&_.ant-drawer-mask]:backdrop-blur-sm', rootClassName)}
      className={cx(
        bodyPadding ? '[&_.ant-drawer-body]:p-6' : '[&_.ant-drawer-body]:p-0',
        closeHover && '[&_.ant-drawer-close:hover]:text-[var(--color-primary-hover)]',
        className
      )}
    >
      {children}
    </AntDrawer>
  )
}
