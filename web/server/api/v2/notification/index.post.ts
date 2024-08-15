import type { Notification } from '@ddradar/core'

import { postBodySchema as schema } from '~~/schemas/notification'

/**
 * Add or update Notification.
 * @description
 * - Need Authentication with `administrator` role.
 * - POST `/api/v2/notification`
 * @returns
 * - Returns `401 Unauthorized` if user is not authenticated or does not have `administrator` role.
 * - Returns `400 BadRequest` if body is invalid.
 * - Returns `200 OK` with updated JSON data if succeed add or update.
 * @example
 * ```jsonc
 * // Request Body
 * {
 *   "color": "yellow",
 *   "icon": "i-heroicons-exclamation-triangle",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *   "pinned": true
 * }
 * ```
 *
 * ```jsonc
 * // Response Body
 * {
 *   "id": "<Auto Generated>",
 *   "color": "yellow",
 *   "icon": "i-heroicons-exclamation-triangle",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *   "timeStamp": 1597024800
 * }
 * ```
 */
export default defineEventHandler(async event => {
  if (!hasRole(event, 'administrator')) throw createError({ statusCode: 401 })
  const body = await readValidatedBody(event, schema.parse)

  const notification = {
    color: body.color,
    icon: body.icon,
    title: body.title,
    body: body.body,
    timeStamp: body.timeStamp || Math.floor(Date.now() / 1000),
    ...(body.id ? { id: body.id } : {}),
  }
  const res = await getNotificationRepository(event).upsert(
    notification,
    body.pinned
  )

  return {
    id: res.id,
    color: res.color,
    icon: res.icon,
    title: res.title,
    body: res.body,
    timeStamp: res.timeStamp,
  } satisfies Notification
})
