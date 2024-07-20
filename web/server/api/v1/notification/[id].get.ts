import { queryContainer } from '@ddradar/db'

import { getRouterParamsSchema as schema } from '~~/schemas/notification'

/**
 * Get notification that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v1/notification/[id]`
 *   - `id`: Notification ID
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
  const { id } = await getValidatedRouterParams(event, schema.parse)

  const [notification] = (
    await queryContainer(
      getCosmosClient(event),
      'Notification',
      ['id', 'sender', 'pinned', 'type', 'icon', 'title', 'body', 'timeStamp'],
      [{ condition: 'c.id = @', value: id }],
      {},
      { maxItemCount: 1 }
    ).fetchNext()
  ).resources
  if (!notification) throw createError({ statusCode: 404 })

  return notification
})
