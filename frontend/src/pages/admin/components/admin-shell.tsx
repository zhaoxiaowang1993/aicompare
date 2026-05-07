import { Link, useNavigate } from 'react-router-dom'
import { DownOutlined, FileTextOutlined, LogoutOutlined, ProfileOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import type { ReactNode } from 'react'
import { clearSession, getStoredUser } from '../../../lib/api'

type AdminShellProps = {
  activeKey: 'plans' | 'users' | 'rules'
  children: ReactNode
}

const navItems = [
  { key: 'plans', label: '标注计划', href: '/admin/plans', icon: ProfileOutlined },
  { key: 'users', label: '成员管理', icon: TeamOutlined },
  { key: 'rules', label: '质控规则', icon: SafetyCertificateOutlined }
] as const

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminShell({ activeKey, children }: AdminShellProps) {
  const navigate = useNavigate()
  const user = getStoredUser()

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-layout)] text-[var(--color-text)] [font-family:Inter,var(--font-family-base)]">
      <header className="flex h-[64px] items-center justify-between border-b border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] px-24">
        <Link to="/admin/plans" className="flex items-center gap-8 text-[var(--color-text)] no-underline">
          <FileTextOutlined className="text-[24px] text-[var(--color-primary)]" aria-hidden="true" />
          <span className="text-lg font-medium">病历质控标注系统</span>
        </Link>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }],
            onClick: ({ key }) => {
              if (key === 'logout') logout()
            }
          }}
        >
          <button
            type="button"
            className="flex h-[32px] items-center gap-8 rounded-md border-0 bg-transparent px-8 text-base font-normal text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-quaternary)]"
          >
            <span>管理员 {user?.username ?? 'admin'}</span>
            <DownOutlined className="text-icon" />
          </button>
        </Dropdown>
      </header>
      <div className="flex min-h-[calc(100vh-64px)]">
        <aside className="w-[232px] shrink-0 border-r border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16">
          <nav className="flex flex-col gap-8">
            {navItems.map((item) => {
              const active = item.key === activeKey
              const Icon = item.icon
              const className = cx(
                'flex h-[40px] w-full items-center gap-8 rounded-md px-12 text-left text-base no-underline transition-colors',
                active
                  ? 'bg-[var(--color-primary-bg)] font-medium text-[var(--color-primary)]'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-fill-quaternary)]'
              )

              const content = (
                <>
                  <Icon
                    className={cx('text-[16px]', active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]')}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </>
              )

              return 'href' in item ? (
                <Link
                  key={item.key}
                  to={item.href}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button key={item.key} type="button" className={cx(className, 'cursor-default border-0 bg-transparent')} aria-disabled="true">
                  {content}
                </button>
              )
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-24">{children}</main>
      </div>
    </div>
  )
}
