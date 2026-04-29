// Generated from design/components/feedback-new.lib.pen - Modal & Dialog
import { Button, Modal as AntModal, Space } from 'antd'
import type { ModalProps as AntModalProps } from 'antd'
import type { ReactNode } from 'react'

export type ModalKind = 'modal' | 'dialog'
export type DialogType = 'confirm' | 'info' | 'warning' | 'error'
export type ModalSize = 'default' | 'medium' | 'large' | 'huge' | 'full'
export type ModalCentered = true | false
export type ModalState = 'CenterFalse' | 'CenterTrue'
export type ModalMask = true | false
export type ModalBlur = true | false
export type ModalFullContent = true | false
export type ModalCloseHover = true | false
export type ModalFooterContentType = 'button' | 'slot'
export type DialogContentType = 'text' | 'slot'

export type ComponentProps = Omit<AntModalProps, 'width' | 'centered' | 'footer' | 'type'> & {
  kind?: ModalKind
  dialogType?: DialogType
  size?: ModalSize
  centered?: ModalCentered
  state?: ModalState
  mask?: ModalMask
  blur?: ModalBlur
  fullContent?: ModalFullContent
  closeHover?: ModalCloseHover
  footerContentType?: ModalFooterContentType
  contentType?: DialogContentType
  content?: ReactNode
  contentSlot?: ReactNode
  footer?: AntModalProps['footer']
  footerSlot?: ReactNode
  okText?: ReactNode
  cancelText?: ReactNode
}
export type ModalDialogComponentProps = ComponentProps

const widthBySize: Record<ModalSize, number | string | undefined> = {
  default: 520,
  medium: 720,
  large: 960,
  huge: 1200,
  full: '100vw'
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function ModalDialog({
  kind = 'modal',
  dialogType = 'confirm',
  size = kind === 'dialog' ? 'default' : 'medium',
  centered = false,
  state,
  mask = true,
  blur = false,
  fullContent = size === 'full',
  closeHover = false,
  footerContentType,
  contentType = 'text',
  content = 'Content',
  contentSlot,
  footer: modalFooter,
  footerSlot,
  okText = 'OK',
  cancelText = 'Cancel',
  children,
  className,
  rootClassName,
  ...modalProps
}: ComponentProps) {
  void state
  void dialogType

  const footer =
    footerContentType === 'slot' ? (
      footerSlot
    ) : footerContentType === 'button' || kind === 'dialog' ? (
      <Space>
        <Button>{cancelText}</Button>
        <Button type="primary">{okText}</Button>
      </Space>
    ) : (
      modalFooter
    )

  return (
    <AntModal
      {...modalProps}
      width={widthBySize[size]}
      centered={centered}
      mask={mask}
      footer={footer}
      rootClassName={cx(blur && '[&_.ant-modal-mask]:backdrop-blur-sm', rootClassName)}
      className={cx(
        fullContent && 'top-0 max-w-none p-0 [&_.ant-modal-content]:min-h-screen [&_.ant-modal-content]:rounded-none',
        closeHover && '[&_.ant-modal-close:hover]:text-[var(--color-primary-hover)]',
        className
      )}
    >
      {children ?? (contentType === 'slot' ? contentSlot : content)}
    </AntModal>
  )
}
