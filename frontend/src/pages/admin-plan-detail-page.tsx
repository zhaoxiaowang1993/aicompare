import { Card, Col, Progress, Row, Statistic } from 'antd'
import PageShell from '../components/layout/page-shell'

export default function AdminPlanDetailPage() {
  return (
    <PageShell title="计划详情">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="总样本" value={180} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已标注" value={120} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待标注" value={60} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Progress type="circle" percent={67} />
          </Card>
        </Col>
      </Row>
    </PageShell>
  )
}
