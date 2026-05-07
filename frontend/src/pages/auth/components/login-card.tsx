import Card from '../../../components/data-display/card'
import Form from '../../../components/data-entry/form'
import Input from '../../../components/data-entry/input'
import Alert from '../../../components/feedback/alert'
import Button from '../../../components/feedback/button'

export type LoginFormValues = {
  username: string
  password: string
}

type LoginCardProps = {
  loading: boolean
  error?: string | null
  onSubmit: (values: LoginFormValues) => void
}

export default function LoginCard({ loading, error, onSubmit }: LoginCardProps) {
  const mode = loading ? 'loading' : error ? 'error' : 'default'

  return (
    <Card className="w-full max-w-[448px] overflow-hidden [&_.ant-card-body]:p-0">
      <div className="border-b border-[var(--color-border-secondary)] px-24 py-16">
        <h2 className="m-0 text-lg font-semibold text-[var(--color-text)]">账号登录</h2>
      </div>
      <div className="p-24">
        {mode === 'default' ? (
          <p className="m-0 mb-16 text-base font-normal text-[var(--color-text-secondary)]">请输入系统预置或管理员创建的账号密码。</p>
        ) : null}
        {mode === 'error' ? <Alert type="error" showIcon message={error} className="mb-16" /> : null}
        {mode === 'loading' ? <Alert type="info" showIcon message="正在验证账号并签发访问令牌..." className="mb-16" /> : null}
        <Form<LoginFormValues> itemLayout="vertical" onFinish={onSubmit} disabled={loading} className="[&_.ant-form-item]:mb-16">
          <Form renderMode="item" label="用户名" itemProps={{ name: 'username', rules: [{ required: true, message: '请输入用户名' }] }}>
            <Input placeholder="请输入用户名" autoComplete="username" />
          </Form>
          <Form renderMode="item" label="密码" itemProps={{ name: 'password', rules: [{ required: true, message: '请输入密码' }] }}>
            <Input kind="password" placeholder="请输入密码" autoComplete="current-password" />
          </Form>
          <Button color="primary" variant="solid" htmlType="submit" loading={loading} block>
            {loading ? '登录中' : error ? '重新登录' : '登录'}
          </Button>
        </Form>
        <div className="mt-16 text-center text-caption font-normal text-[var(--color-text-secondary)]">
          {error ? '连续失败或忘记密码时，由管理员在成员管理中重置密码。' : '忘记密码请联系管理员'}
        </div>
      </div>
    </Card>
  )
}
