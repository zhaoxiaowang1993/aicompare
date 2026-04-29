// Generated from design/components/feedback-new.lib.pen - Notification
import { notification as antNotification } from 'antd'
import type { ArgsProps } from 'antd/es/notification/interface'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

export type NotificationType = 'default' | 'success' | 'info' | 'warning' | 'error'
export type NotificationCustomIcon = true | false
export type NotificationState = 'default'
export type NotificationActionsContentType = 'button' | 'slot'
export type NotificationCloseHover = true | false

export type ComponentProps = Omit<ArgsProps, 'type' | 'message' | 'description' | 'icon'> & {
  type?: NotificationType
  customIcon?: NotificationCustomIcon
  state?: NotificationState
  actionsContentType?: NotificationActionsContentType
  closeHover?: NotificationCloseHover
  message?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  openOnMount?: boolean
}
export type NotificationComponentProps = ComponentProps

export default function Notification({
  type = 'default',
  customIcon = false,
  state = 'default',
  actionsContentType,
  closeHover = false,
  message = 'Notification Title',
  description = 'This is the content of the notification.',
  icon,
  openOnMount = true,
  className,
  ...notificationProps
}: ComponentProps) {
  const [api, contextHolder] = antNotification.useNotification()
  void state
  void actionsContentType
  void closeHover

  useEffect(() => {
    if (!openOnMount) return

    const payload = {
      message,
      description,
      icon: customIcon ? icon : undefined,
      className,
      ...notificationProps
    }

    if (type === 'default') {
      api.open(payload)
      return
    }

    api[type](payload)
  }, [api, className, customIcon, description, icon, message, notificationProps, openOnMount, type])

  return contextHolder
}
