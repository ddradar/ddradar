import { Database, Song } from '@ddradar/core'
import { Condition, fetchList } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'
import { useQuery } from 'h3'

import { tryFetchUser } from '~/server/auth'
import { getQueryInteger, sendNullWithError } from '~/server/utils'

export type GrooveRadarInfo = Omit<
  Database.GrooveRadarSchema,
  'userId' | 'type'
>

/**
 * Get Groove Radar that match the specified {@link Database.UserSchema.id userId} and {@link GrooveRadarInfo.playStyle playStyle}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/:id/radar?style=:style`
 *   - `id`: {@link Database.UserSchema.id}
 *   - `style`(optional): {@link GrooveRadarInfo.playStyle}
 * @param event HTTP Event
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
export default async (event: CompatibilityEvent) => {
  const user = await tryFetchUser(event)
  if (!user) return sendNullWithError(event, 404)

  const query = useQuery(event)
  const style = getQueryInteger(query, 'style')

  const conditions: Condition<'UserDetails'>[] = [
    { condition: 'c.userId = @', value: user.id },
    { condition: 'c.type = "radar"' },
  ]
  if (Song.isPlayStyle(style)) {
    conditions.push({ condition: 'c.playStyle = @', value: style })
  }

  return (await fetchList(
    'UserDetails',
    ['playStyle', 'stream', 'voltage', 'air', 'freeze', 'chaos'],
    conditions,
    { playStyle: 'ASC' }
  )) as GrooveRadarInfo[]
}
