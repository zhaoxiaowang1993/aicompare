// Generated from design/components/data-entry-new.lib.pen - Input
import { Input as AntInput } from 'antd'
import type { InputProps as AntInputProps, InputRef } from 'antd'
import type { SizeType } from 'antd/es/config-provider/SizeContext'
import type { TextAreaProps } from 'antd/es/input'
import type { SearchProps } from 'antd/es/input/Search'
import type { ComponentProps as ReactComponentProps, ReactNode } from 'react'

export type InputKind = 'input' | 'password' | 'textarea' | 'search' | 'addon'
export type InputVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type InputSize = 'default' | 'small' | 'large'
export type InputState = 'default' | 'hover' | 'active'
export type InputDisabled = true | false
export type InputTyping = true | false
export type InputPlaceholder = true | false
export type InputFeedbackType = 'error' | 'success' | 'validating' | 'warning'
export type InputAddon = 'none' | 'before' | 'after' | 'both'
export type InputEnterButton = 'default' | 'icon' | 'text'
export type InputComponentStatus = 'default' | 'error' | 'warning'

export type ComponentProps = Omit<AntInputProps, 'variant' | 'size' | 'status' | 'disabled'> &
  Partial<Pick<TextAreaProps, 'autoSize' | 'rows'>> &
  Partial<Pick<SearchProps, 'enterButton' | 'onSearch' | 'loading'>> & {
    kind?: InputKind
    variant?: InputVariant
    size?: InputSize
    state?: InputState
    status?: InputComponentStatus
    disabled?: InputDisabled
    typing?: InputTyping
    placeholderVisible?: InputPlaceholder
    feedbackType?: InputFeedbackType
    addon?: InputAddon
    enterButtonType?: InputEnterButton
    addonBeforeContent?: ReactNode
    addonAfterContent?: ReactNode
    inputRef?: ReactComponentProps<typeof AntInput>['ref'] | ReactComponentProps<typeof AntInput.Password>['ref'] | ReactComponentProps<typeof AntInput.TextArea>['ref']
  }
export type InputComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function mapSize(size: InputSize): SizeType {
  return size === 'default' ? 'middle' : size
}

function mapStatus(status: InputComponentStatus): 'error' | 'warning' | undefined {
  return status === 'default' ? undefined : status
}

export default function Input({
  kind = 'input',
  variant = 'outlined',
  size = 'default',
  state = 'default',
  status = 'default',
  disabled = false,
  typing = false,
  placeholderVisible = true,
  feedbackType,
  addon = 'none',
  enterButtonType = 'default',
  addonBeforeContent,
  addonAfterContent,
  inputRef,
  className,
  placeholder = 'Input',
  value,
  defaultValue,
  autoSize,
  rows,
  enterButton,
  onSearch,
  loading,
  ...inputProps
}: ComponentProps) {
  void typing
  void feedbackType

  const sharedProps = {
    ...inputProps,
    variant,
    size: mapSize(size),
    status: mapStatus(status),
    disabled,
    placeholder: placeholderVisible ? placeholder : undefined,
    value,
    defaultValue,
    className: cx(
      'rounded-md',
      state === 'hover' && 'border-[var(--color-primary-hover)]',
      state === 'active' && 'border-[var(--color-primary)] shadow-[var(--input-active-shadow)]',
      className
    )
  }

  if (kind === 'password') {
    return <AntInput.Password {...sharedProps} ref={inputRef as ReactComponentProps<typeof AntInput.Password>['ref']} />
  }

  if (kind === 'textarea') {
    return (
      <AntInput.TextArea
        {...(sharedProps as TextAreaProps)}
        autoSize={autoSize}
        rows={rows}
        ref={inputRef as ReactComponentProps<typeof AntInput.TextArea>['ref']}
      />
    )
  }

  if (kind === 'search') {
    const effectiveEnterButton = enterButtonType === 'default' ? enterButton : enterButtonType === 'text' ? 'Search' : true
    return <AntInput.Search {...sharedProps} enterButton={effectiveEnterButton} onSearch={onSearch} loading={loading} />
  }

  return (
    <AntInput
      {...sharedProps}
      ref={inputRef as ReactComponentProps<typeof AntInput>['ref'] & React.Ref<InputRef>}
      addonBefore={addon === 'before' || addon === 'both' ? addonBeforeContent : undefined}
      addonAfter={addon === 'after' || addon === 'both' ? addonAfterContent : undefined}
    />
  )
}
