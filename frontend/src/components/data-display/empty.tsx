// Generated from design/components/data-display-new.lib.pen - Empty
import { Empty as AntEmpty } from 'antd'
import type { EmptyProps as AntEmptyProps } from 'antd'

export type EmptySize = 'default' | 'normal' | 'small'
export type EmptyImageVariant = 'none' | 'default' | 'simple' | 'blueSimple' | 'custom'
export type EmptyState = 'default'

export type ComponentProps = Omit<AntEmptyProps, 'image'> & {
  size?: EmptySize
  imageVariant?: EmptyImageVariant
  state?: EmptyState
  customImage?: AntEmptyProps['image']
}
export type EmptyComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function BlueSimpleEmptyImage() {
  return (
    <svg width="92" height="72" viewBox="0 0 92 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="16" y="18" width="60" height="40" rx="6" fill="var(--color-primary-bg)" />
      <path d="M22 28H70" stroke="var(--color-primary-border)" strokeWidth="2" strokeLinecap="round" />
      <path d="M27 38H51" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <path d="M27 47H62" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <path d="M16 58H76" stroke="var(--color-primary-border)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="69" cy="17" r="7" fill="var(--color-primary-bg-hover)" stroke="var(--color-primary-border)" />
      <path d="M66.5 17H71.5" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M69 14.5V19.5" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function Empty({
  size = 'default',
  imageVariant = 'none',
  state = 'default',
  customImage,
  className,
  description = 'No data',
  ...emptyProps
}: ComponentProps) {
  void state

  const image =
    imageVariant === 'none'
      ? null
      : imageVariant === 'simple'
        ? AntEmpty.PRESENTED_IMAGE_SIMPLE
        : imageVariant === 'blueSimple'
          ? <BlueSimpleEmptyImage />
          : imageVariant === 'custom'
            ? customImage
            : AntEmpty.PRESENTED_IMAGE_DEFAULT

  return (
    <AntEmpty
      {...emptyProps}
      image={image}
      description={description}
      className={cx(
        'text-[var(--color-text-secondary)]',
        size === 'small' && 'my-8 [&_.ant-empty-description]:text-xs',
        size === 'normal' && 'my-16 [&_.ant-empty-description]:text-sm',
        size === 'default' && 'my-24',
        className
      )}
    />
  )
}
