// Generated from design/components/layout-new.lib.pen - Layout
import { Breadcrumb, Button, Layout as AntLayout, Menu } from 'antd'
import type { BreadcrumbProps, LayoutProps as AntLayoutProps, MenuProps } from 'antd'
import type { ReactNode } from 'react'

export type LayoutType = 'headerContentFooter' | 'headerSider' | 'headerSider2' | 'sider' | 'customTrigger'
export type LayoutState = 'default'
export type LayoutTheme = 'light' | 'dark'
export type LayoutHeaderEmpty = true | false
export type LayoutHeaderLevel = 1 | 2
export type LayoutContentType = 'empty' | 'demo1' | 'demo2' | 'demo3'
export type LayoutFooterType = 'default' | 'slot' | 'empty'
export type LayoutSiderTheme = 'light' | 'dark'

export type ComponentProps = Omit<AntLayoutProps, 'children'> & {
  type?: LayoutType
  state?: LayoutState
  title?: ReactNode
  logo?: ReactNode
  headerTheme?: LayoutTheme
  headerEmpty?: LayoutHeaderEmpty
  headerLevel?: LayoutHeaderLevel
  headerStart?: ReactNode
  headerEnd?: ReactNode
  headerMenuItems?: MenuProps['items']
  selectedHeaderKeys?: MenuProps['selectedKeys']
  siderTheme?: LayoutSiderTheme
  siderItems?: MenuProps['items']
  selectedSiderKeys?: MenuProps['selectedKeys']
  siderSlotTop?: ReactNode
  siderSlotBottom?: ReactNode
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  trigger?: ReactNode
  contentType?: LayoutContentType
  breadcrumbItems?: BreadcrumbProps['items']
  footerType?: LayoutFooterType
  footer?: ReactNode
  contentClassName?: string
  children?: ReactNode
}
export type LayoutComponentProps = ComponentProps

const { Header, Content, Footer, Sider } = AntLayout

const defaultHeaderItems: MenuProps['items'] = [
  { key: '1', label: 'nav 1' },
  { key: '2', label: 'nav 2' },
  { key: '3', label: 'nav 3' }
]

const defaultSiderItems: MenuProps['items'] = [
  { key: 'sub', label: 'Navigation', children: [{ key: '1', label: 'Option 1' }, { key: '2', label: 'Option 2' }] },
  { key: '3', label: 'Option 3' },
  { key: '4', label: 'Option 4' }
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function hasHeader(type: LayoutType) {
  return type === 'headerContentFooter' || type === 'headerSider' || type === 'headerSider2'
}

function hasSider(type: LayoutType) {
  return type === 'sider' || type === 'headerSider2' || type === 'customTrigger'
}

export default function Layout({
  type = 'headerContentFooter',
  state = 'default',
  title,
  logo,
  headerTheme = 'dark',
  headerEmpty = false,
  headerLevel = 1,
  headerStart,
  headerEnd,
  headerMenuItems = defaultHeaderItems,
  selectedHeaderKeys,
  siderTheme = 'dark',
  siderItems = defaultSiderItems,
  selectedSiderKeys,
  siderSlotTop,
  siderSlotBottom,
  collapsed,
  onCollapse,
  trigger,
  contentType = hasSider(type) ? 'demo2' : 'demo1',
  breadcrumbItems,
  footerType = 'default',
  footer = 'Ant Design ©2025 Created by Ant UED',
  contentClassName,
  children,
  className,
  ...layoutProps
}: ComponentProps) {
  void state
  void headerLevel
  void contentType

  const isHeaderDark = headerTheme === 'dark'
  const isSiderDark = siderTheme === 'dark'
  const layoutContent = (
    <Content className={cx('min-h-0 bg-[var(--color-bg-layout)] p-24', contentClassName)}>
      {breadcrumbItems ? <Breadcrumb items={breadcrumbItems} className="mb-16" /> : null}
      <div className="min-h-[280px] rounded-lg bg-[var(--color-bg-container)] p-24">
        {children ?? <span className="text-[var(--color-text-secondary)]">Content</span>}
      </div>
    </Content>
  )

  const sider = hasSider(type) ? (
    <Sider
      theme={siderTheme}
      collapsible={type === 'customTrigger'}
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={type === 'customTrigger' ? null : undefined}
      className={cx(isSiderDark ? 'bg-[var(--layout-sider-bg)]' : 'bg-[var(--color-bg-container)]')}
    >
      {siderSlotTop}
      <Menu
        theme={siderTheme}
        mode="inline"
        items={siderItems}
        selectedKeys={selectedSiderKeys}
        className={cx('border-0', isSiderDark ? 'bg-[var(--layout-sider-bg)]' : 'bg-[var(--color-bg-container)]')}
      />
      {siderSlotBottom}
    </Sider>
  ) : null

  return (
    <AntLayout {...layoutProps} className={cx('min-h-screen overflow-hidden rounded-lg bg-[var(--color-bg-layout)]', className)}>
      {hasHeader(type) && !headerEmpty ? (
        <Header
          className={cx(
            'flex h-[64px] items-center gap-16 px-24',
            isHeaderDark ? 'bg-[var(--layout-sider-bg)] text-[var(--color-white)]' : 'bg-[var(--color-bg-container)] text-[var(--color-text)]'
          )}
        >
          <div className="flex shrink-0 items-center gap-12 pr-12">
            {logo}
            {title ? <span className="text-base font-medium">{title}</span> : null}
            {headerStart}
          </div>
          <Menu
            theme={headerTheme}
            mode="horizontal"
            items={headerMenuItems}
            selectedKeys={selectedHeaderKeys}
            className={cx('min-w-0 flex-1 border-0', isHeaderDark ? 'bg-[var(--layout-sider-bg)]' : 'bg-[var(--color-bg-container)]')}
          />
          {headerEnd}
        </Header>
      ) : null}
      <AntLayout>
        {sider}
        <AntLayout>
          {type === 'customTrigger' ? (
            <div className="flex h-[48px] items-center bg-[var(--color-bg-container)] px-16">
              {trigger ?? <Button type="text" onClick={() => onCollapse?.(!collapsed)}>{collapsed ? 'Expand' : 'Collapse'}</Button>}
            </div>
          ) : null}
          {layoutContent}
          {footerType !== 'empty' ? <Footer className="text-center text-[var(--color-text-secondary)]">{footerType === 'slot' ? footer : footer}</Footer> : null}
        </AntLayout>
      </AntLayout>
    </AntLayout>
  )
}
