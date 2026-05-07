import Alert from '../../../components/feedback/alert'
import Button from '../../../components/feedback/button'

type PageErrorProps = {
  message: string
  onRetry?: () => void
}

export default function PageError({ message, onRetry }: PageErrorProps) {
  return (
    <div className="rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] p-16">
      <Alert type="error" message={message} className="mb-12" />
      {onRetry ? (
        <Button color="primary" variant="outlined" onClick={onRetry}>
          重试
        </Button>
      ) : null}
    </div>
  )
}
