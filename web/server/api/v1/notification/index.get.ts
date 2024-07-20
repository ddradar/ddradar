import { queryContainer } from '@ddradar/db'

import { getListQuerySchema as schema } from '~~/schemas/notification'

/**
 * Get system notification list.
 * @description
 * - No need Authentication.
 * - GET `api/v1/notification?scope=:scope`
 *   - `scope`(optional): `top`: only pinne} notification, other: all notification
 * @returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "<Auto Generated>",
 *     "type": "is-info",
 *     "icon": "info",
 *     "title": "このサイトはベータ版です",
 *     "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *     "timeStamp": 1597028400
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { scope } = await getValidatedQuery(event, schema.parse)

  const { resources } = await queryContainer(
    getCosmosClient(event),
    'Notification',
    ['id', 'type', 'icon', 'title', 'body', 'timeStamp'],
    [
      { condition: 'c.sender = "SYSTEM"' },
      ...(scope === 'top' ? ([{ condition: 'c.pinned = true' }] as const) : []),
    ]
  ).fetchAll()
  return resources
})
