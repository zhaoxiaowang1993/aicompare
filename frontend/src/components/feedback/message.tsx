// Generated from design/components/feedback-new.lib.pen - Message
import { message as antMessage } from 'antd'
import type { ArgsProps } from 'antd/es/message'
import { useEffect } from 'react'

export type MessageType = 'default' | 'loading' | 'info' | 'success' | 'error' | 'warning'
export type MessageState = 'default'

export type ComponentProps = Omit<ArgsProps, 'type' | 'content'> & {
  type?: MessageType
  state?: MessageState
  content?: ArgsProps['content']
  openOnMount?: boolean
}
export type MessageComponentProps = ComponentProps

export default function Message({ type = 'default', state = 'default', content, openOnMount = true, ...messageProps }: ComponentProps) {
  const [api, contextHolder] = antMessage.useMessage()
  void state

  useEffect(() => {
    if (!openOnMount) return

    const payload = { content: content ?? defaultContentByType[type], ...messageProps }
    if (type === 'default') {
      void api.open(payload)
      return
    }

    void api[type](payload)
  }, [api, content, messageProps, openOnMount, type])

  return contextHolder
}

const defaultContentByType: Record<MessageType, ArgsProps['content']> = {
  default: 'Hello, Ant Design!',
  loading: 'Loading...',
  info: 'Hello, Ant Design!',
  success: 'This is a success message',
  error: 'This is an error message',
  warning: 'This is a warning message'
}
