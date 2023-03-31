import { Condition, fetchList } from '@ddradar/db'
import type { NotificationSchema } from '@ddradar/db-definitions'
import { getQuery } from 'h3'

import { getQueryString } from '~~/utils/path'

type Notification = Omit<NotificationSchema, 'sender' | 'pinned'>

/**
 * Get system notification list.
 * @description
 * - No need Authentication.
 * - GET `api/v1/notification?scope=:scope`
 *   - `scope`(optional): `top`: only {@link NotificationSchema.pinned pinned} notification, other: all notification
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
  const pinnedOnly = getQueryString(getQuery(event), 'scope') === 'top'

  const conditions: Condition<'Notification'>[] = [
    { condition: 'c.sender = "SYSTEM"' },
  ]
  if (pinnedOnly) conditions.push({ condition: 'c.pinned = true' })

  return (await fetchList(
    'Notification',
    ['id', 'type', 'icon', 'title', 'body', 'timeStamp'],
    conditions,
    { pinned: 'DESC', timeStamp: 'DESC' }
  )) as Notification[]
})
