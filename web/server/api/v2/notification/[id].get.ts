import { getRouterParamsSchema as schema } from '~~/schemas/notification'

/**
 * Get notification that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `/api/v2/notification/[id]`
 *   - `id`: Notification ID
 * @returns
 * - Returns `404 Not Found` if no data that matches `id`.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
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
  const { id } = await getValidatedRouterParams(event, schema.parse)

  const notification = await getNotificationRepository(event).get(id)
  if (!notification) throw createError({ statusCode: 404 })

  return notification
})
