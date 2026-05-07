// Generated from design/components/data-entry-new.lib.pen - Radio
import { Radio as AntRadio } from 'antd'
import type { RadioChangeEvent, RadioGroupProps, RadioProps } from 'antd'
import type { ReactNode } from 'react'

export type RadioMode = 'radio' | 'group' | 'button'
export type RadioVariant = 'default'
export type RadioHover = true | false
export type RadioDisabled = true | false
export type RadioChecked = true | false
export type RadioButtonStyle = 'outline' | 'solid'
export type RadioSize = 'default' | 'small' | 'large'
export type RadioDirection = 'horizontal' | 'vertical'
export type RadioState =
  | 'HoverFalse-DisabledFalse-CheckedFalse'
  | 'HoverFalse-DisabledFalse-CheckedTrue'
  | 'HoverFalse-DisabledTrue-CheckedFalse'
  | 'HoverFalse-DisabledTrue-CheckedTrue'
  | 'HoverTrue-DisabledFalse-CheckedFalse'

export type ComponentProps = Omit<RadioProps, 'checked' | 'disabled'> & {
  mode?: RadioMode
  variant?: RadioVariant
  hover?: RadioHover
  disabled?: RadioDisabled
  checked?: RadioChecked
  buttonStyle?: RadioButtonStyle
  size?: RadioSize
  direction?: RadioDirection
  state?: RadioState
  label?: ReactNode
  options?: RadioGroupProps['options']
  value?: RadioGroupProps['value']
  defaultValue?: RadioGroupProps['defaultValue']
  onGroupChange?: (event: RadioChangeEvent) => void
}
export type RadioComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function mapSize(size: RadioSize) {
  return size === 'default' ? 'middle' : size
}

export default function Radio({
  mode = 'radio',
  variant = 'default',
  hover = false,
  disabled = false,
  checked,
  buttonStyle = 'outline',
  size = 'default',
  direction = 'horizontal',
  state,
  label = 'Radio',
  options,
  value,
  defaultValue,
  onGroupChange,
  className,
  children,
  ...radioProps
}: ComponentProps) {
  void variant
  void state

  const buttonOptions = options?.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { label: option, value: option }
    }

    return option
  })

  if (mode === 'group' || mode === 'button') {
    return (
      <AntRadio.Group
        options={mode === 'group' ? options : undefined}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        buttonStyle={buttonStyle}
        size={mapSize(size)}
        onChange={onGroupChange}
        className={cx(direction === 'vertical' && 'flex flex-col gap-8', className)}
      >
        {mode === 'button'
          ? (children ??
            buttonOptions?.map((option) => (
              <AntRadio.Button key={String(option.value)} value={option.value}>
                {option.label}
              </AntRadio.Button>
            )))
          : children}
      </AntRadio.Group>
    )
  }

  return (
    <AntRadio
      {...radioProps}
      checked={checked}
      disabled={disabled}
      className={cx(hover && !disabled && '[&_.ant-radio-inner]:border-[var(--color-primary-hover)]', className)}
    >
      {children ?? label}
    </AntRadio>
  )
}
