// Generated from design/components/data-entry-new.lib.pen - Form
import { Form as AntForm, Tooltip } from 'antd'
import type { FormItemProps, FormProps } from 'antd'
import type { ReactNode } from 'react'

export type FormRenderMode = 'form' | 'item'
export type FormItemLayout = 'vertical' | 'horizontal'
export type FormItemContentType =
  | 'text'
  | 'password'
  | 'number'
  | 'select'
  | 'mention'
  | 'autoComplete'
  | 'datePicker'
  | 'dateRangePicker'
  | 'time'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'search'
  | 'inputAddon'
  | 'segmented'
  | 'colorPicker'
  | 'slider'
  | 'rate'
export type FormLabelDirection = 'vertical' | 'horizontal'
export type FormLabelContentType = 'text' | 'slot'
export type FormFooterExtra = 'default' | 'help' | 'required' | 'requiredAndHelp'
export type FormValidateStatus = 'success' | 'warning' | 'error' | 'validating'
export type FormState = 'default'

export type ComponentProps<Values = unknown> = Omit<FormProps<Values>, 'layout'> & {
  renderMode?: FormRenderMode
  itemLayout?: FormItemLayout
  itemType?: FormItemContentType
  labelDirection?: FormLabelDirection
  labelContentType?: FormLabelContentType
  footerExtra?: FormFooterExtra
  state?: FormState
  itemProps?: Omit<FormItemProps, 'children' | 'validateStatus'>
  label?: ReactNode
  labelSlot?: ReactNode
  labelIcon?: ReactNode
  requiredMarkContent?: ReactNode
  optionalText?: ReactNode
  tooltip?: ReactNode
  help?: ReactNode
  extra?: ReactNode
  validateStatus?: FormValidateStatus
  children?: ReactNode
}
export type FormComponentProps<Values = unknown> = ComponentProps<Values>

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function renderLabel({
  label,
  labelSlot,
  labelIcon,
  requiredMarkContent,
  optionalText,
  tooltip,
  labelContentType
}: Pick<ComponentProps, 'label' | 'labelSlot' | 'labelIcon' | 'requiredMarkContent' | 'optionalText' | 'tooltip' | 'labelContentType'>) {
  return (
    <span className="inline-flex items-center gap-1">
      {labelIcon}
      {requiredMarkContent ? <span className="text-[var(--color-error)]">{requiredMarkContent}</span> : null}
      {labelContentType === 'slot' ? labelSlot : label}
      {optionalText ? <span className="text-[var(--color-text-secondary)]">{optionalText}</span> : null}
      {tooltip ? <Tooltip title={tooltip}>?</Tooltip> : null}
    </span>
  )
}

export default function Form<Values = unknown>({
  renderMode = 'form',
  itemLayout = 'vertical',
  itemType = 'text',
  labelDirection = itemLayout,
  labelContentType = 'text',
  footerExtra = 'default',
  state = 'default',
  itemProps,
  label = 'Label',
  labelSlot,
  labelIcon,
  requiredMarkContent,
  optionalText,
  tooltip,
  help,
  extra,
  validateStatus,
  children,
  className,
  ...formProps
}: ComponentProps<Values>) {
  void itemType
  void labelDirection
  void footerExtra
  void state

  if (renderMode === 'item') {
    return (
      <AntForm.Item
        {...itemProps}
        label={renderLabel({ label, labelSlot, labelIcon, requiredMarkContent, optionalText, tooltip, labelContentType })}
        help={help ?? itemProps?.help}
        extra={extra ?? itemProps?.extra}
        validateStatus={validateStatus}
        className={cx(
          '[&_.ant-form-item-label>label]:text-[var(--color-text)] [&_.ant-form-item-extra]:text-[var(--color-text-secondary)]',
          className,
          itemProps?.className
        )}
      >
        {children}
      </AntForm.Item>
    )
  }

  return (
    <AntForm<Values>
      {...formProps}
      layout={itemLayout}
      className={cx('[&_.ant-form-item]:mb-6 [&_.ant-form-item-label>label]:text-[var(--color-text)]', className)}
    >
      {children}
    </AntForm>
  )
}
