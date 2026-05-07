// Generated from design/components/data-entry-new.lib.pen - Checkbox
import { Checkbox as AntCheckbox } from 'antd'
import type { CheckboxProps as AntCheckboxProps, CheckboxOptionType } from 'antd'
import type { ReactNode } from 'react'

export type CheckboxShowLabel = true | false
export type CheckboxHover = true | false
export type CheckboxDisabled = true | false
export type CheckboxChecked = true | false
export type CheckboxIndeterminate = true | false
export type CheckboxDirection = 'horizontal' | 'vertical'
export type CheckboxMode = 'checkbox' | 'group'
export type CheckboxState =
  | 'HoverFalse-DisabledFalse-CheckedFalse-IndeterminateFalse'
  | 'HoverFalse-DisabledFalse-CheckedFalse-IndeterminateTrue'
  | 'HoverFalse-DisabledFalse-CheckedTrue-IndeterminateFalse'
  | 'HoverFalse-DisabledTrue-CheckedFalse-IndeterminateFalse'
  | 'HoverFalse-DisabledTrue-CheckedTrue-IndeterminateFalse'
  | 'HoverFalse-DisabledTrue-CheckedTrue-IndeterminateTrue'
  | 'HoverTrue-DisabledFalse-CheckedFalse-IndeterminateFalse'
  | 'HoverTrue-DisabledFalse-CheckedFalse-IndeterminateTrue'
  | 'HoverTrue-DisabledFalse-CheckedTrue-IndeterminateFalse'

export type ComponentProps = Omit<AntCheckboxProps, 'checked' | 'disabled' | 'indeterminate'> & {
  mode?: CheckboxMode
  showLabel?: CheckboxShowLabel
  hover?: CheckboxHover
  disabled?: CheckboxDisabled
  checked?: CheckboxChecked
  indeterminate?: CheckboxIndeterminate
  direction?: CheckboxDirection
  state?: CheckboxState
  label?: ReactNode
  options?: Array<CheckboxOptionType>
  value?: Array<string | number | boolean>
  defaultValue?: Array<string | number | boolean>
  onGroupChange?: (checkedValue: Array<string | number | boolean>) => void
}
export type CheckboxComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Checkbox({
  mode = 'checkbox',
  showLabel = true,
  hover = false,
  disabled = false,
  checked,
  indeterminate = false,
  direction = 'horizontal',
  state,
  label = 'Checkbox',
  options,
  value,
  defaultValue,
  onGroupChange,
  className,
  children,
  ...checkboxProps
}: ComponentProps) {
  void state

  if (mode === 'group') {
    return (
      <AntCheckbox.Group
        options={options}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onGroupChange}
        className={cx(direction === 'vertical' && 'flex flex-col gap-8', className)}
      />
    )
  }

  return (
    <AntCheckbox
      {...checkboxProps}
      checked={checked}
      disabled={disabled}
      indeterminate={indeterminate}
      className={cx(
        'inline-flex items-center text-sm',
        hover && !disabled && '[&_.ant-checkbox-inner]:border-[var(--color-primary-hover)]',
        className
      )}
    >
      {showLabel ? (children ?? label) : null}
    </AntCheckbox>
  )
}
