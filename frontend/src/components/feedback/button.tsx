// Generated from design/components/general-new.lib.pen - Button
import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'
import type { ReactNode } from 'react'

export type ButtonColor = 'default' | 'primary' | 'danger'
export type ButtonState = 'default' | 'hover' | 'active' | 'disabled'
export type ButtonVariant = 'dashed' | 'filled' | 'link' | 'outlined' | 'solid' | 'text'
export type ButtonSize = 'small' | 'middle' | 'large'
export type ButtonShape = 'default' | 'round' | 'circle'
export type ButtonContent = 'text' | 'iconOnly'
export type ButtonCombination =
  `${Capitalize<ButtonColor>}/${Capitalize<ButtonState>}/${Capitalize<ButtonVariant>}/${Capitalize<ButtonSize>}/${Capitalize<ButtonShape>}/${'Text' | 'IconOnly'}`

export type ComponentProps = Omit<AntButtonProps, 'color' | 'variant' | 'size' | 'shape' | 'disabled' | 'danger'> & {
  color?: ButtonColor
  state?: ButtonState
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  content?: ButtonContent
  combination?: ButtonCombination
  disabled?: boolean
  label?: ReactNode
}
export type ButtonComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function mapShape(shape: ButtonShape): AntButtonProps['shape'] {
  return shape === 'default' ? undefined : shape
}

export default function Button({
  color = 'default',
  state = 'default',
  variant = 'outlined',
  size = 'middle',
  shape = 'default',
  content = 'text',
  combination,
  label = 'Button',
  icon,
  disabled,
  className,
  children,
  ...buttonProps
}: ComponentProps) {
  void combination

  const isDisabled = disabled ?? state === 'disabled'
  const isDanger = color === 'danger'

  return (
    <AntButton
      {...buttonProps}
      color={color}
      variant={variant}
      size={size}
      shape={mapShape(shape)}
      danger={isDanger}
      disabled={isDisabled}
      icon={icon}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-normal',
        content === 'iconOnly' && 'aspect-square px-0',
        state === 'hover' && !isDisabled && 'border-[var(--color-primary-hover)] text-[var(--color-primary-hover)]',
        state === 'active' && !isDisabled && 'border-[var(--color-primary-active)] text-[var(--color-primary-active)]',
        isDanger && state === 'hover' && !isDisabled && 'border-[var(--color-error-hover)] text-[var(--color-error-hover)]',
        isDanger && state === 'active' && !isDisabled && 'border-[var(--color-error-active)] text-[var(--color-error-active)]',
        className
      )}
    >
      {content === 'iconOnly' ? null : (children ?? label)}
    </AntButton>
  )
}
