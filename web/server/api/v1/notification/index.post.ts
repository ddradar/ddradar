import { getContainer } from '@ddradar/db'

import { postBodySchema as schema } from '~~/schemas/notification'

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
 *   "color": "yellow",
 *   "icon": "i-heroicons-exclamation-triangle",
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
 *   "color": "yellow",
 *   "icon": "i-heroicons-exclamation-triangle",
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
    color: body.color,
    icon: body.icon,
    title: body.title,
    body: body.body,
    timeStamp: body.timeStamp || Math.floor(Date.now() / 1000),
    ...(body.id ? { id: body.id } : {}),
  }
  await getContainer('Notification').items.upsert(notification)

  return notification
})
