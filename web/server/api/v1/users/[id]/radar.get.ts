import { Condition, fetchList } from '@ddradar/db'
import type { UserGrooveRadarSchema } from '@ddradar/db-definitions'
import { isPlayStyle } from '@ddradar/db-definitions'
import { getQuery } from 'h3'

import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { getQueryInteger } from '~~/utils/path'

export type GrooveRadarInfo = Omit<UserGrooveRadarSchema, 'userId' | 'type'>

/**
 * Get Groove Radar that match the specified userId and playStyle.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/:id/radar?style=:style`
 *   - `id`: UserSchema.id
 *   - `style`(optional): {@link GrooveRadarInfo.playStyle}
 * @returns
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   {
 *     "playStyle": 1,
 *     "stream": 100,
 *     "voltage": 100,
 *     "air": 100,
 *     "freeze": 100,
 *     "chaos": 100
 *   },
 *   {
 *     "playStyle": 2,
 *     "stream": 100,
 *     "voltage": 100,
 *     "air": 100,
 *     "freeze": 100,
 *     "chaos": 100
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const user = await tryFetchUser(event)
  if (!user) return sendNullWithError(event, 404)

  const query = getQuery(event)
  const style = getQueryInteger(query, 'style')

  const conditions: Condition<'UserDetails'>[] = [
    { condition: 'c.userId = @', value: user.id },
    { condition: 'c.type = "radar"' },
  ]
  if (isPlayStyle(style)) {
    conditions.push({ condition: 'c.playStyle = @', value: style })
  }

  return (await fetchList(
    'UserDetails',
    ['playStyle', 'stream', 'voltage', 'air', 'freeze', 'chaos'],
    conditions,
    { playStyle: 'ASC' }
  )) as GrooveRadarInfo[]
})
