import type { Database } from '@ddradar/core'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '@ddradar/core'
import { getContainer } from '@ddradar/db'
import type { H3Event } from 'h3'
import { readBody } from 'h3'

import { sendNullWithError } from '~/server/utils'

export type NotificationBody = Partial<Database.NotificationSchema> &
  Omit<Database.NotificationSchema, 'id' | 'timeStamp'>

/**
 * Add or update Notification.
 * @description
 * - Need Authentication with `administrator` role.
 * - POST `/api/v1/notification`
 * @param event HTTP Event
 * @returns
 * - Returns `401 Unauthorized` if user is not authenticated or does not have `administrator` role.
 * - Returns `400 BadRequest` if body is invalid.
 * - Returns `200 OK` with updated JSON data if succeed add or update.
 * @example
 * ```jsonc
 * // Request Body
 * {
 *   "sender": "SYSTEM",
 *   "pinned": true,
 *   "type": "is-info",
 *   "icon": "info",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。"
 * }
 * ```
 *
 * ```jsonc
 * // Response Body
 * {
 *   "sender": "SYSTEM",
 *   "pinned": true,
 *   "type": "is-info",
 *   "icon": "info",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *   "timeStamp": 1597024800
 * }
 * ```
 */
export default async (event: H3Event) => {
  const body = await readBody(event)
  if (!isNotificationBody(body)) {
    return sendNullWithError(event, 400, 'Invalid Body')
  }

  const notification = {
    sender: body.sender,
    pinned: body.pinned,
    type: body.type,
    icon: body.icon,
    title: body.title,
    body: body.body,
    timeStamp: body.timeStamp || Math.floor(Date.now() / 1000),
    ...(body.id ? { id: body.id } : {}),
  }
  await getContainer('Notification').items.upsert(notification)

  return notification

  /** Type assertion for {@link NotificationBody}. */
  function isNotificationBody(obj: unknown): obj is NotificationBody {
    return (
      hasStringProperty(obj, 'sender', 'type', 'icon', 'title', 'body') &&
      obj.sender === 'SYSTEM' &&
      ['is-info', 'is-warning'].includes(obj.type) &&
      hasProperty(obj, 'pinned') &&
      typeof obj.pinned === 'boolean' &&
      (!hasProperty(obj, 'id') || hasStringProperty(obj, 'id')) &&
      (!hasProperty(obj, 'timeStamp') || hasIntegerProperty(obj, 'timeStamp'))
    )
  }
}
