import { type NotificationSchema, notificationSchema } from '@ddradar/core'
import { getContainer } from '@ddradar/db'
import { z } from 'zod'

export type NotificationBody = Partial<NotificationSchema> &
  Omit<NotificationSchema, 'id' | 'timeStamp'>

/** Expected body */
const schema = notificationSchema
  .omit({ timeStamp: true })
  .extend({ timeStamp: z.onumber() })

/**
 * Add or update Notification.
 * @description
 * - Need Authentication with `administrator` role.
 * - POST `/api/v1/notification`
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
export default defineEventHandler(async event => {
  const body = await readValidatedBody(event, schema.parse)

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
})
