// Generated from design/components/data-display-new.lib.pen - Empty
import { Empty as AntEmpty } from 'antd'
import type { EmptyProps as AntEmptyProps } from 'antd'

export type EmptySize = 'default' | 'normal' | 'small'
export type EmptyImageVariant = 'none' | 'default' | 'simple' | 'custom'
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
        size === 'small' && 'my-2 [&_.ant-empty-description]:text-xs',
        size === 'normal' && 'my-4 [&_.ant-empty-description]:text-sm',
        size === 'default' && 'my-8',
        className
      )}
    />
  )
}
