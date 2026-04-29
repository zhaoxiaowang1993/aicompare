import { Button, Card, Space, Table, Tag } from 'antd'
import PageShell from '../components/layout/layout'

const users = [
  { key: 1, username: 'admin', role: 'admin', isActive: true },
  { key: 2, username: 'czy', role: 'operator', isActive: true }
]

export default function AdminUsersPage() {
  return (
    <PageShell title="成员管理">
      <Card extra={<Button type="primary">新增成员</Button>}>
        <Table
          dataSource={users}
          columns={[
            { title: '用户名', dataIndex: 'username' },
            { title: '角色', dataIndex: 'role' },
            {
              title: '状态',
              dataIndex: 'isActive',
              render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? '启用' : '禁用'}</Tag>
            },
            {
              title: '操作',
              render: () => (
                <Space>
                  <Button size="small">重置密码</Button>
                  <Button size="small" danger>
                    禁用
                  </Button>
                </Space>
              )
            }
          ]}
          pagination={false}
        />
      </Card>
    </PageShell>
  )
}
