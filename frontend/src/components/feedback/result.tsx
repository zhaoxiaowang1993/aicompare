// Generated from design/components/feedback-new.lib.pen - Result
import { Button, Result as AntResult, Space } from 'antd'
import type { ResultProps as AntResultProps } from 'antd'
import type { ReactNode } from 'react'

export type ResultVariant = 'default'
export type ResultStatus = 'success' | 'info' | 'warning' | 'error' | '403' | '404' | '500'
export type ResultCustomIcon = true | false
export type ResultState =
  | 'StatusSuccess-CustomIconFalse'
  | 'StatusInfo-CustomIconFalse'
  | 'StatusInfo-CustomIconTrue'
  | 'StatusWarning-CustomIconFalse'
  | 'StatusError-CustomIconFalse'
  | 'Status403-CustomIconFalse'
  | 'Status404-CustomIconFalse'
  | 'Status500-CustomIconFalse'
export type ResultContentType = 'text' | 'slot'
export type ResultExtraContentType = 'button' | 'slot'

export type ComponentProps = Omit<AntResultProps, 'status' | 'icon' | 'title' | 'subTitle' | 'extra'> & {
  variant?: ResultVariant
  status?: ResultStatus
  customIcon?: ResultCustomIcon
  state?: ResultState
  contentType?: ResultContentType
  extraContentType?: ResultExtraContentType
  icon?: ReactNode
  title?: ReactNode
  subTitle?: ReactNode
  content?: ReactNode
  contentSlot?: ReactNode
  extraSlot?: ReactNode
  primaryActionText?: ReactNode
  secondaryActionText?: ReactNode
}
export type ResultComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Result({
  variant = 'default',
  status = 'info',
  customIcon = false,
  state,
  contentType = 'text',
  extraContentType = 'button',
  icon,
  title = 'Title',
  subTitle = 'Subtitle',
  content,
  contentSlot,
  extraSlot,
  primaryActionText = 'Back Home',
  secondaryActionText = 'Again',
  className,
  ...resultProps
}: ComponentProps) {
  void variant
  void state

  const extra =
    extraContentType === 'slot' ? (
      extraSlot
    ) : (
      <Space>
        <Button type="primary">{primaryActionText}</Button>
        <Button>{secondaryActionText}</Button>
      </Space>
    )

  return (
    <AntResult
      {...resultProps}
      status={status}
      icon={customIcon ? icon : undefined}
      title={title}
      subTitle={subTitle}
      extra={extra}
      className={cx('[&_.ant-result-title]:text-[var(--color-text)] [&_.ant-result-subtitle]:text-[var(--color-text-secondary)]', className)}
    >
      {contentType === 'slot' ? contentSlot : content}
    </AntResult>
  )
}
