// Generated from design/components/navigation-new.lib.pen - Pagination
import { Pagination as AntPagination } from 'antd'
import type { PaginationProps as AntPaginationProps } from 'antd'

export type PaginationVariant = 'default'
export type PaginationMore = true | false
export type PaginationChanger = true | false
export type PaginationJumper = true | false
export type PaginationSimple = true | false
export type PaginationDisabled = true | false
export type PaginationSmall = true | false
export type PaginationState =
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleFalse-DisabledFalse-SmallFalse'
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleFalse-DisabledFalse-SmallTrue'
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleFalse-DisabledTrue-SmallFalse'
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleFalse-DisabledTrue-SmallTrue'
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleTrue-DisabledFalse-SmallFalse'
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleTrue-DisabledFalse-SmallTrue'
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleTrue-DisabledTrue-SmallFalse'
  | 'MoreFalse-ChangerFalse-JumperFalse-SimpleTrue-DisabledTrue-SmallTrue'
  | 'MoreTrue-ChangerFalse-JumperFalse-SimpleFalse-DisabledFalse-SmallFalse'
  | 'MoreTrue-ChangerFalse-JumperFalse-SimpleFalse-DisabledFalse-SmallTrue'
  | 'MoreTrue-ChangerFalse-JumperFalse-SimpleFalse-DisabledTrue-SmallFalse'
  | 'MoreTrue-ChangerFalse-JumperFalse-SimpleFalse-DisabledTrue-SmallTrue'
  | 'MoreTrue-ChangerTrue-JumperFalse-SimpleFalse-DisabledFalse-SmallFalse'
  | 'MoreTrue-ChangerTrue-JumperFalse-SimpleFalse-DisabledFalse-SmallTrue'
  | 'MoreTrue-ChangerTrue-JumperFalse-SimpleFalse-DisabledTrue-SmallFalse'
  | 'MoreTrue-ChangerTrue-JumperFalse-SimpleFalse-DisabledTrue-SmallTrue'
  | 'MoreTrue-ChangerTrue-JumperTrue-SimpleFalse-DisabledFalse-SmallFalse'
  | 'MoreTrue-ChangerTrue-JumperTrue-SimpleFalse-DisabledFalse-SmallTrue'
  | 'MoreTrue-ChangerTrue-JumperTrue-SimpleFalse-DisabledTrue-SmallFalse'
  | 'MoreTrue-ChangerTrue-JumperTrue-SimpleFalse-DisabledTrue-SmallTrue'
export type PaginationItemState = 'default' | 'hover' | 'active'
export type PaginationArrowState = 'default' | 'hover' | 'active'
export type PaginationMoreState = 'default' | 'hover'

export type ComponentProps = Omit<
  AntPaginationProps,
  'showSizeChanger' | 'showQuickJumper' | 'simple' | 'disabled' | 'size'
> & {
  variant?: PaginationVariant
  more?: PaginationMore
  changer?: PaginationChanger
  jumper?: PaginationJumper
  simple?: PaginationSimple
  disabled?: PaginationDisabled
  small?: PaginationSmall
  state?: PaginationState
  itemState?: PaginationItemState
  arrowState?: PaginationArrowState
  moreState?: PaginationMoreState
}
export type PaginationComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Pagination({
  variant = 'default',
  more = true,
  changer = false,
  jumper = false,
  simple = false,
  disabled = false,
  small = false,
  state,
  itemState = 'default',
  arrowState = 'default',
  moreState = 'default',
  className,
  total = more ? 500 : 50,
  ...paginationProps
}: ComponentProps) {
  void variant
  void state

  return (
    <AntPagination
      {...paginationProps}
      total={total}
      showSizeChanger={changer}
      showQuickJumper={jumper}
      simple={simple}
      disabled={disabled}
      size={small ? 'small' : 'middle'}
      className={cx(
        '[&_.ant-pagination-item]:rounded-md [&_.ant-pagination-item-active]:border-[var(--color-primary)]',
        itemState === 'hover' && '[&_.ant-pagination-item]:border-[var(--color-primary-hover)]',
        itemState === 'active' && '[&_.ant-pagination-item]:border-[var(--color-primary-active)]',
        arrowState === 'hover' && '[&_.ant-pagination-prev_.ant-pagination-item-link]:text-[var(--color-primary-hover)] [&_.ant-pagination-next_.ant-pagination-item-link]:text-[var(--color-primary-hover)]',
        arrowState === 'active' && '[&_.ant-pagination-prev_.ant-pagination-item-link]:text-[var(--color-primary-active)] [&_.ant-pagination-next_.ant-pagination-item-link]:text-[var(--color-primary-active)]',
        moreState === 'hover' && '[&_.ant-pagination-jump-prev]:text-[var(--color-primary-hover)] [&_.ant-pagination-jump-next]:text-[var(--color-primary-hover)]',
        className
      )}
    />
  )
}
