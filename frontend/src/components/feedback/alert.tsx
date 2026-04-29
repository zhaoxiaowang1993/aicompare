// Generated from design/components/feedback-new.lib.pen - Alert
import { Alert as AntAlert, Button, Space } from 'antd'
import type { AlertProps as AntAlertProps } from 'antd'
import type { ReactNode } from 'react'

export type AlertType = 'success' | 'info' | 'warning' | 'error'
export type AlertDescription = true | false
export type AlertBanner = true | false
export type AlertState =
  | 'DescriptionFalse-BannerFalse'
  | 'DescriptionFalse-BannerTrue'
  | 'DescriptionTrue-BannerFalse'
  | 'DescriptionTrue-BannerTrue'
export type AlertMessageType = 'text' | 'slot'
export type AlertDescriptionType = 'text' | 'slot'
export type AlertCloseType = 'icon' | 'text' | 'iconAndText'
export type AlertExtraAction = 'singleButton' | 'doubleButton' | 'slot'

export type ComponentProps = Omit<AntAlertProps, 'type' | 'description' | 'banner' | 'message' | 'action'> & {
  type?: AlertType
  descriptionVisible?: AlertDescription
  banner?: AlertBanner
  state?: AlertState
  messageType?: AlertMessageType
  descriptionType?: AlertDescriptionType
  closeType?: AlertCloseType
  extraAction?: AlertExtraAction
  message?: ReactNode
  messageSlot?: ReactNode
  description?: ReactNode
  descriptionSlot?: ReactNode
  actionSlot?: ReactNode
  primaryActionText?: ReactNode
  secondaryActionText?: ReactNode
  closeText?: ReactNode
}
export type AlertComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Alert({
  type = 'info',
  descriptionVisible = false,
  banner = false,
  state,
  messageType = 'text',
  descriptionType = 'text',
  closeType = 'icon',
  extraAction,
  message = 'Alert message',
  messageSlot,
  description = 'Detailed description and advice about successful copywriting.',
  descriptionSlot,
  actionSlot,
  primaryActionText = 'Action',
  secondaryActionText = 'Cancel',
  closeText,
  className,
  ...alertProps
}: ComponentProps) {
  void state

  const action =
    extraAction === 'slot' ? (
      actionSlot
    ) : extraAction === 'doubleButton' ? (
      <Space size={8}>
        <Button size="small">{secondaryActionText}</Button>
        <Button size="small" type="primary">
          {primaryActionText}
        </Button>
      </Space>
    ) : extraAction === 'singleButton' ? (
      <Button size="small" type="primary">
        {primaryActionText}
      </Button>
    ) : undefined

  return (
    <AntAlert
      {...alertProps}
      type={type}
      banner={banner}
      message={messageType === 'slot' ? messageSlot : message}
      description={descriptionVisible ? (descriptionType === 'slot' ? descriptionSlot : description) : undefined}
      action={action}
      closeText={closeType === 'text' || closeType === 'iconAndText' ? closeText : undefined}
      closable={alertProps.closable ?? closeType !== 'icon'}
      className={cx(
        'rounded-lg',
        banner && 'rounded-none',
        '[&_.ant-alert-message]:text-[var(--color-text)] [&_.ant-alert-description]:text-[var(--color-text-secondary)]',
        className
      )}
    />
  )
}
