import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../type-assert'

type NotificationType = 'is-info' | 'is-warning'

export type NotificationSchema = {
  id: string
  sender: 'SYSTEM'
  pinned: boolean
  type: NotificationType
  icon: string
  title: string
  body: string
  _ts: number
}

export function isNotification(obj: unknown): obj is NotificationSchema {
  return (
    hasStringProperty(obj, 'id', 'sender', 'type', 'icon', 'title', 'body') &&
    obj.sender === 'SYSTEM' &&
    ['is-info', 'is-warning'].includes(obj.type) &&
    hasProperty(obj, 'pinned') &&
    typeof obj.pinned === 'boolean' &&
    hasIntegerProperty(obj, '_ts')
  )
}
