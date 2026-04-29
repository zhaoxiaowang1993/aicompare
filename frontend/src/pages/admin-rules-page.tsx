import { Button, Card, Input, Space, Table } from 'antd'
import PageShell from '../components/layout/layout'

const rules = [
  { key: 1, code: 'RULE_CHIEF_COMPLAINT_MAX_20', name: '主诉不得超过20字', score: 5 }
]

export default function AdminRulesPage() {
  return (
    <PageShell title="质控规则管理">
      <Card>
        <Space direction="vertical" className="w-full" size={16}>
          <Space>
            <Input.Search placeholder="按规则名称搜索" />
            <Button type="primary">新增规则</Button>
          </Space>
          <Table
            dataSource={rules}
            columns={[
              { title: '规则编码', dataIndex: 'code' },
              { title: '规则名称', dataIndex: 'name' },
              { title: '分值', dataIndex: 'score' }
            ]}
            pagination={false}
          />
        </Space>
      </Card>
    </PageShell>
  )
}
