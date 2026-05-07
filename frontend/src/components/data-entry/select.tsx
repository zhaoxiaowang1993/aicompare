// Generated from design/components/data-entry-new.lib.pen - Select
import { Select as AntSelect } from 'antd'
import type { SelectProps as AntSelectProps } from 'antd'

export type SelectMultiple = true | false
export type SelectSearchable = true | false
export type SelectWrap = true | false
export type SelectState = 'default' | 'hover' | 'active'
export type SelectOpen = true | false
export type SelectVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type SelectSize = 'default' | 'small' | 'large'

export type ComponentProps<ValueType = unknown, OptionType extends object = object> = Omit<
  AntSelectProps<ValueType, OptionType>,
  'mode' | 'showSearch' | 'open' | 'variant' | 'size'
> & {
  multiple?: SelectMultiple
  searchable?: SelectSearchable
  wrap?: SelectWrap
  state?: SelectState
  open?: SelectOpen
  variant?: SelectVariant
  size?: SelectSize
}
export type SelectComponentProps<ValueType = unknown, OptionType extends object = object> = ComponentProps<ValueType, OptionType>

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function mapSize(size: SelectSize) {
  return size === 'default' ? 'middle' : size
}

export default function Select<ValueType = unknown, OptionType extends object = object>({
  multiple = false,
  searchable = false,
  wrap = false,
  state = 'default',
  open,
  variant = 'outlined',
  size = 'default',
  className,
  popupClassName,
  classNames,
  ...selectProps
}: ComponentProps<ValueType, OptionType>) {
  return (
    <AntSelect<ValueType, OptionType>
      {...selectProps}
      mode={multiple ? 'multiple' : undefined}
      showSearch={searchable}
      open={open}
      variant={variant}
      size={mapSize(size)}
      maxTagCount={wrap ? undefined : 'responsive'}
      className={cx(
        'min-w-40',
        '[&_.ant-select-selection-item]:!font-normal [&_.ant-select-selection-item_*]:!font-normal [&_.ant-select-selection-item-content]:!font-normal [&_.ant-select-selection-overflow]:!font-normal [&_.ant-select-selection-overflow_*]:!font-normal',
        '[&_.ant-select-selection-placeholder]:!font-normal [&_.ant-select-selection-search-input]:!font-normal',
        '[&_.ant-select-selector]:text-base [&_.ant-select-selector]:!font-normal [&_.ant-select-selector_*]:!font-normal',
        state === 'hover' && '[&_.ant-select-selector]:border-[var(--color-primary-hover)]',
        state === 'active' &&
          '[&_.ant-select-selector]:border-[var(--select-active-border-color)] [&_.ant-select-selector]:shadow-[0_0_0_var(--control-outline-width)_var(--select-active-outline-color)]',
        className
      )}
      classNames={{
        ...classNames,
        popup: {
          ...classNames?.popup,
          root: cx(
            'rounded-md [&_.ant-select-item-option]:!font-normal [&_.ant-select-item-option_*]:!font-normal [&_.ant-select-item-option-content]:!font-normal [&_.ant-select-item-option-selected]:!font-normal',
            classNames?.popup?.root,
            popupClassName
          )
        }
      }}
    />
  )
}
