import { Card, Table, Tag } from 'antd'
import PageShell from '../components/layout/layout'

const dataSource = [
  { key: 1, name: '2026Q2 质控对比评审', owner: 'czy', status: 'active' }
]

export default function AdminPlansPage() {
  return (
    <PageShell title="计划列表">
      <Card>
        <Table
          dataSource={dataSource}
          columns={[
            { title: '计划名称', dataIndex: 'name' },
            { title: '负责人', dataIndex: 'owner' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (value: string) => <Tag color={value === 'active' ? 'green' : 'default'}>{value}</Tag>
            }
          ]}
          pagination={false}
        />
      </Card>
    </PageShell>
  )
}
