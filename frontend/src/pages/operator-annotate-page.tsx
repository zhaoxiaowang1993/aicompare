import { Button, Card, Col, Form, Input, Radio, Row, Select, Space, Typography } from 'antd'
import PageShell from '../components/layout/page-shell'

export default function OperatorAnnotatePage() {
  return (
    <PageShell title="标注详情">
      <Row gutter={16}>
        <Col xs={24} xl={8}>
          <Card title="病历内容" className="h-full">
            <Typography.Paragraph>病历内容占位...</Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="结果 A" className="h-full">
            <Typography.Paragraph>智能体 A/B 映射后的展示内容占位...</Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="结果 B" className="h-full">
            <Typography.Paragraph>智能体 A/B 映射后的展示内容占位...</Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4" title="提交标注">
        <Form layout="vertical">
          <Form.Item label="结论" required>
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="A_BETTER">A_BETTER</Radio>
                <Radio value="B_BETTER">B_BETTER</Radio>
                <Radio value="BOTH_BAD">BOTH_BAD</Radio>
                <Radio value="BOTH_GOOD">BOTH_GOOD</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="原因（可多选）" required>
            <Select mode="multiple" options={[
              { value: 'NO_HIT_ERROR_RULE', label: 'NO_HIT_ERROR_RULE' },
              { value: 'NO_MISSING_RULE', label: 'NO_MISSING_RULE' },
              { value: 'NO_OVER_QC', label: 'NO_OVER_QC' },
              { value: 'OTHER', label: 'OTHER' }
            ]} />
          </Form.Item>
          <Form.Item label="其他原因">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            提交并进入下一条
          </Button>
        </Form>
      </Card>
    </PageShell>
  )
}
