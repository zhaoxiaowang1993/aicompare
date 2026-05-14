import { Link, useNavigate } from 'react-router-dom'
import { DownOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import type { ReactNode } from 'react'
import { clearSession, getStoredUser } from '../../../lib/api'

type OperatorShellProps = {
  children: ReactNode
  mainClassName?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function OperatorShell({ children, mainClassName }: OperatorShellProps) {
  const navigate = useNavigate()
  const user = getStoredUser()

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg-layout pt-[64px] text-text font-sans">
      <header className="fixed inset-x-0 top-0 z-30 flex h-[64px] items-center justify-between border-b border-border-secondary bg-bg-container px-16 md:px-24">
        <Link to="/operator/plans" className="flex items-center gap-8 text-text no-underline">
          <FileTextOutlined className="text-[24px] text-primary" aria-hidden="true" />
          <span className="hidden text-lg font-medium sm:inline">病历质控标注系统</span>
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
            className="flex h-[32px] items-center gap-8 rounded-md border-0 bg-transparent px-8 text-base font-normal text-text-secondary hover:bg-fill-quaternary"
          >
            <span>操作员 {user?.username ?? 'operator'}</span>
            <DownOutlined className="text-icon" />
          </button>
        </Dropdown>
      </header>
      <main className={cx('min-h-[calc(100vh-64px)] p-16 md:p-24', mainClassName)}>{children}</main>
    </div>
  )
}
