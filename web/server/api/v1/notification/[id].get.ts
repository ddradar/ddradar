import type { NotificationSchema } from '@ddradar/core'
import { fetchOne } from '@ddradar/db'
import { z } from 'zod'

import { sendNullWithError } from '~~/server/utils/http'

/** Expected params */
const schema = z.object({ id: z.string() })

/**
 * Get notification that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v1/notification/:id`
 *   - `id`: {@link NotificationSchema.id}
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

  const notification = (await fetchOne(
    'Notification',
    ['id', 'sender', 'pinned', 'type', 'icon', 'title', 'body', 'timeStamp'],
    { condition: 'c.id = @', value: id }
  )) as NotificationSchema | null

  return notification ?? sendNullWithError(event, 404)
})
