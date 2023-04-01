import { Notification } from './graphql'
import {
  hasBooleanProperty,
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from './type-assert'

/**
 * DB schema of "Notification" container
 * @example
 * ```json
 * {
 *   "id": "<Auto Generated>",
 *   "sender": "SYSTEM",
 *   "pinned": true,
 *   "type": "is-info",
 *   "icon": "info",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *   "timeStamp": 1597028400
 * }
 * ```
 */
export type NotificationSchema = Notification

/** Type assertion for {@link NotificationSchema}. */
export function isNotificationSchema(obj: unknown): obj is NotificationSchema {
  return (
    hasStringProperty(obj, 'sender', 'type', 'icon', 'title', 'body') &&
    obj.sender === 'SYSTEM' &&
    hasBooleanProperty(obj, 'pinned') &&
    (!hasProperty(obj, 'id') || hasStringProperty(obj, 'id')) &&
    (!hasProperty(obj, 'timeStamp') || hasIntegerProperty(obj, 'timeStamp'))
  )
}
