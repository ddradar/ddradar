type NotificationType = 'is-info' | 'is-warning'

export type NotificationSchema = {
  id: string
  sender: 'SYSTEM'
  pinned: boolean
  type: NotificationType
  icon: string
  title: string
  body: string
  timeStamp: number
}
