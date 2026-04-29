// Generated from design/components/data-entry-new.lib.pen - Switch
import { Switch as AntSwitch } from 'antd'
import type { SwitchProps as AntSwitchProps } from 'antd'
import type { ReactNode } from 'react'

export type SwitchMode = 'default' | 'textAndIcon'
export type SwitchSize = 'medium' | 'small'
export type SwitchState = 'default' | 'hover' | 'active'
export type SwitchChecked = true | false
export type SwitchDisabled = true | false
export type SwitchLoading = true | false

export type ComponentProps = Omit<AntSwitchProps, 'size' | 'checked' | 'disabled' | 'loading'> & {
  mode?: SwitchMode
  size?: SwitchSize
  state?: SwitchState
  checked?: SwitchChecked
  disabled?: SwitchDisabled
  loading?: SwitchLoading
  checkedContent?: ReactNode
  uncheckedContent?: ReactNode
}
export type SwitchComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Switch({
  mode = 'default',
  size = 'medium',
  state = 'default',
  checked,
  disabled = false,
  loading = false,
  checkedContent,
  uncheckedContent,
  className,
  ...switchProps
}: ComponentProps) {
  return (
    <AntSwitch
      {...switchProps}
      size={size === 'small' ? 'small' : 'default'}
      checked={checked}
      disabled={disabled}
      loading={loading}
      checkedChildren={mode === 'textAndIcon' ? checkedContent : switchProps.checkedChildren}
      unCheckedChildren={mode === 'textAndIcon' ? uncheckedContent : switchProps.unCheckedChildren}
      className={cx(
        state === 'hover' && 'bg-[var(--color-primary-hover)]',
        state === 'active' && 'bg-[var(--color-primary-active)]',
        className
      )}
    />
  )
}
