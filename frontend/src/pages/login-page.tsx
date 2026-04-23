import { Button, Card, Form, Input, Typography } from 'antd'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ant-bgBase p-6">
      <Card className="w-full max-w-md shadow-ant">
        <Typography.Title level={3}>病历质控标注系统</Typography.Title>
        <Typography.Paragraph type="secondary">管理员与操作员统一登录入口</Typography.Paragraph>
        <Form layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </main>
  )
}
