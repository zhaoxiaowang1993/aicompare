import type { ReactNode } from 'react'
import { Layout, Typography } from 'antd'

interface PageShellProps {
  title: string
  children: ReactNode
}

export default function PageShell({ title, children }: PageShellProps) {
  return (
    <Layout className="min-h-screen bg-ant-bgBase">
      <Layout.Header className="flex items-center bg-white px-6">
        <Typography.Title level={4} className="!mb-0 !text-ant-text">
          {title}
        </Typography.Title>
      </Layout.Header>
      <Layout.Content className="mx-auto w-full max-w-7xl p-6">{children}</Layout.Content>
    </Layout>
  )
}
