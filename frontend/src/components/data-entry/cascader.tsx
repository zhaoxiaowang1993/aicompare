// Generated from design/data-entry.lib.pen - Cascader
import { CloseCircleFilled, LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { Cascader as AntCascader } from 'antd'
import type { CascaderProps as AntCascaderProps, CascaderRef, DefaultOptionType } from 'antd/es/cascader'
import type { SizeType } from 'antd/es/config-provider/SizeContext'
import type { ReactNode, Ref } from 'react'

export type CascaderMode = 'single' | 'multiple' | 'searchable'
export type CascaderSearchable = true | false
export type CascaderOpen = true | false
export type CascaderVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type CascaderSize = 'default' | 'small' | 'large'
export type CascaderState = 'default' | 'hover' | 'active'
export type CascaderDisabled = true | false
export type CascaderStatus = 'default' | 'error' | 'warning'
export type CascaderPopupVariant = 'default' | 'empty'
export type CascaderPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type CascaderItemVariant = 'default' | 'tag'
export type CascaderItemState = 'default' | 'disabled' | 'placeholder' | 'typing' | 'placeholderTyping' | 'customTag' | 'customTagTyping'
export type CascaderMenuItemMode = 'single' | 'multiple'
export type CascaderMenuItemState = 'default' | 'disabled' | 'hover' | 'selected' | 'selectedDisabled'
export type CascaderFooterVariant = 'custom' | 'slot'
export type CascaderTagSize = 'default' | 'small' | 'large'
export type CascaderTagState = 'default' | 'disabled'
export type CascaderSuffixIconVariant = 'default' | 'remove' | 'search' | 'loading'

type OmittedAntCascaderProp =
  | 'multiple'
  | 'showSearch'
  | 'open'
  | 'variant'
  | 'size'
  | 'disabled'
  | 'status'
  | 'placement'
  | 'popupClassName'
  | 'dropdownClassName'

type AntCascaderBaseProps<
  OptionType extends DefaultOptionType,
  ValueField extends keyof OptionType
> =
  | Omit<AntCascaderProps<OptionType, ValueField, false>, OmittedAntCascaderProp>
  | Omit<AntCascaderProps<OptionType, ValueField, true>, OmittedAntCascaderProp>

export type ComponentProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType
> = AntCascaderBaseProps<OptionType, ValueField> & {
  mode?: CascaderMode
  multiple?: boolean
  searchable?: CascaderSearchable
  searchConfig?: Exclude<AntCascaderProps<OptionType, ValueField, boolean>['showSearch'], boolean | undefined>
  open?: CascaderOpen
  variant?: CascaderVariant
  size?: CascaderSize
  state?: CascaderState
  disabled?: CascaderDisabled
  status?: CascaderStatus
  popupVariant?: CascaderPopupVariant
  placement?: CascaderPlacement
  popupClassName?: string
  itemVariant?: CascaderItemVariant
  itemState?: CascaderItemState
  menuItemMode?: CascaderMenuItemMode
  menuItemState?: CascaderMenuItemState
  footerVariant?: CascaderFooterVariant
  tagSize?: CascaderTagSize
  tagState?: CascaderTagState
  suffixIconVariant?: CascaderSuffixIconVariant
  suffixIcon?: ReactNode
  cascaderRef?: Ref<CascaderRef>
}
export type CascaderComponentProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType
> = ComponentProps<OptionType, ValueField>

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function mapSize(size: CascaderSize): SizeType {
  return size === 'default' ? 'middle' : size
}

function mapStatus(status: CascaderStatus): 'error' | 'warning' | undefined {
  return status === 'default' ? undefined : status
}

function renderSuffixIcon(suffixIcon: ReactNode, suffixIconVariant: CascaderSuffixIconVariant) {
  if (suffixIcon !== undefined) {
    return suffixIcon
  }

  if (suffixIconVariant === 'loading') {
    return <LoadingOutlined className="text-[var(--color-text-secondary)]" aria-hidden="true" />
  }

  if (suffixIconVariant === 'search') {
    return <SearchOutlined className="text-[var(--color-text-secondary)]" aria-hidden="true" />
  }

  if (suffixIconVariant === 'remove') {
    return <CloseCircleFilled className="text-[var(--color-text-secondary)]" aria-hidden="true" />
  }

  return undefined
}

export default function Cascader<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType
>({
  mode = 'single',
  multiple,
  searchable = false,
  searchConfig,
  open,
  variant = 'outlined',
  size = 'default',
  state = 'default',
  disabled = false,
  status = 'default',
  popupVariant = 'default',
  placement = 'bottomLeft',
  popupClassName,
  itemVariant = 'default',
  itemState = 'default',
  menuItemMode,
  menuItemState = 'default',
  footerVariant = 'custom',
  tagSize,
  tagState = 'default',
  suffixIconVariant = 'default',
  suffixIcon,
  cascaderRef,
  className,
  classNames,
  ...cascaderProps
}: ComponentProps<OptionType, ValueField>) {
  const isMultiple = mode === 'multiple' || Boolean(multiple)
  const isSearchable = mode === 'searchable' || searchable

  void popupVariant
  void itemVariant
  void itemState
  void menuItemMode
  void menuItemState
  void footerVariant
  void tagSize
  void tagState

  const sharedProps = {
    ...cascaderProps,
    showSearch: searchConfig ?? isSearchable,
    open,
    variant,
    size: mapSize(size),
    disabled,
    status: mapStatus(status),
    placement,
    suffixIcon: renderSuffixIcon(suffixIcon, suffixIconVariant),
    className: cx(
      'aicompare-cascader min-w-40 text-base font-normal',
      '[&_.ant-select-selection-item]:font-normal [&_.ant-select-selection-item_*]:font-normal',
      '[&_.ant-select-selection-placeholder]:font-normal [&_.ant-select-selection-search-input]:font-normal',
      '[&_.ant-select-selector]:text-base [&_.ant-select-selector]:font-normal [&_.ant-select-selector]:outline-none [&_.ant-select-selector_*]:font-normal',
      '[&.ant-select-focused_.ant-select-selector]:outline-none',
      state === 'hover' && '[&_.ant-select-selector]:border-[var(--color-primary-hover)]',
      state === 'active' &&
        '[&_.ant-select-selector]:border-[var(--select-active-border-color)] [&_.ant-select-selector]:shadow-[0_0_0_var(--control-outline-width)_var(--select-active-outline-color)]',
      className
    ),
    classNames: {
      ...classNames,
      popup: {
        ...classNames?.popup,
        root: cx(
          'aicompare-cascader-popup rounded-md',
          '[&_.ant-cascader-menu]:font-normal [&_.ant-cascader-menu_*]:font-normal',
          '[&_.ant-cascader-menu-item]:font-normal [&_.ant-cascader-menu-item_*]:font-normal',
          '[&_.ant-cascader-menu-item-content]:font-normal',
          '[&_.ant-cascader-menu-item.ant-cascader-menu-item-active_.ant-cascader-menu-item-content]:font-normal',
          '[&_.ant-cascader-menu-item-keyword]:font-normal',
          classNames?.popup?.root,
          popupClassName
        ),
        list: cx('font-normal', classNames?.popup?.list),
        listItem: cx('font-normal', classNames?.popup?.listItem)
      }
    }
  }

  if (isMultiple) {
    return (
      <AntCascader<OptionType, ValueField>
        {...(sharedProps as AntCascaderProps<OptionType, ValueField, true>)}
        ref={cascaderRef}
        multiple
      />
    )
  }

  return (
    <AntCascader<OptionType, ValueField>
      {...(sharedProps as AntCascaderProps<OptionType, ValueField, false>)}
      ref={cascaderRef}
      multiple={false}
    />
  )
}
