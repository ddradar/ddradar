import type { NotificationInfo } from '~/schemas/notification'
import { getRouterParamsSchema as schema } from '~/schemas/notification'

/**
 * Get notification that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v1/notification/[id]`
 *   - `id`: {@link NotificationInfo.id}
 * @returns
 * - Returns `404 Not Found` if no data that matches `id`.
 * - Returns `200 OK` with JSON body if found.
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
 *   "timeStamp": 1597024800
 * }
 * ```
 */
export default defineEventHandler(async event => {
  const variables = await getValidatedRouterParams(event, schema.parse)

  const query = /* GraphQL */ `
    query ($id: ID!) {
      notification_by_pk(id: $id) {
        id
        sender
        pinned
        type
        icon
        title
        body
        timeStamp
      }
    }
  `
  const { notification_by_pk: notification } = await $graphql<{
    notification_by_pk: NotificationInfo | null
  }>(event, query, variables)
  if (!notification) throw createError({ statusCode: 404 })

  return notification
})
