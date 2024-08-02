import { getListQuerySchema as schema } from '~~/schemas/notification'

/**
 * Get system notification list.
 * @description
 * - No need Authentication.
 * - GET `/api/v2/notification?scope=:scope`
 *   - `scope`(optional): `top`: only pinne} notification, other: all notification
 * @returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "<Auto Generated>",
 *     "color": "yellow",
 *     "icon": "i-heroicons-exclamation-triangle",
 *     "title": "このサイトはベータ版です",
 *     "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *     "timeStamp": 1597028400
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { scope } = await getValidatedQuery(event, schema.parse)

  return await getNotificationRepository(event).list(
    scope ? [{ condition: 'c.pinned = true' }] : []
  )
})
