// Generated from design/components/data-display-new.lib.pen - Table
import { Empty, Table as AntTable } from 'antd'
import type { TableProps as AntTableProps } from 'antd'

export type TableSize = 'large' | 'middle' | 'small'
export type TableBorder = 'bordered' | 'borderless'
export type TableEmptyVariant = 'empty' | 'noEmpty'
export type TableState = 'default'
export type TableColumnVariant =
  | 'text'
  | 'badge'
  | 'link'
  | 'tag'
  | 'dragger'
  | 'expendable'
  | 'radio'
  | 'checkbox'
  | 'editable'

export type ComponentProps<RecordType extends object = object> = Omit<
  AntTableProps<RecordType>,
  'size' | 'bordered'
> & {
  size?: TableSize
  border?: TableBorder
  emptyVariant?: TableEmptyVariant
  state?: TableState
  columnVariant?: TableColumnVariant
}
export type TableComponentProps<RecordType extends object = object> = ComponentProps<RecordType>

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Table<RecordType extends object = object>({
  size = 'large',
  border = 'bordered',
  emptyVariant = 'noEmpty',
  state = 'default',
  columnVariant = 'text',
  className,
  locale,
  ...tableProps
}: ComponentProps<RecordType>) {
  void state
  void columnVariant

  const antSize = size === 'large' ? 'large' : size

  return (
    <AntTable<RecordType>
      {...tableProps}
      size={antSize}
      bordered={border === 'bordered'}
      locale={{
        ...locale,
        emptyText:
          emptyVariant === 'empty' ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" className="my-24" />
          ) : (
            locale?.emptyText
          )
      }}
      className={cx(
        'rounded-lg bg-[var(--color-bg-container)]',
        '[&_.ant-table]:rounded-lg [&_.ant-table-thead>tr>th]:bg-[var(--color-bg-layout)]',
        size === 'small' && '[&_.ant-table-cell]:px-12 [&_.ant-table-cell]:py-8',
        size === 'middle' && '[&_.ant-table-cell]:px-16 [&_.ant-table-cell]:py-12',
        border === 'borderless' && '[&_.ant-table-cell]:border-x-0',
        className
      )}
    />
  )
}
