import {
  type UserGrooveRadarSchema,
  userGrooveRadarSchema,
} from '@ddradar/core'
import { type Condition, fetchList } from '@ddradar/db'
import { z } from 'zod'

import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'

export type GrooveRadarInfo = Omit<UserGrooveRadarSchema, 'userId' | 'type'>

/** Expected queries */
const schema = z.object({
  style: z.coerce
    .number()
    .pipe(userGrooveRadarSchema.shape.playStyle)
    .optional()
    .catch(undefined),
})
/** Default radar value */
const radar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }

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

  const { style } = await getValidatedQuery(event, schema.parse)

  const conditions: Condition<'UserDetails'>[] = [
    { condition: 'c.userId = @', value: user.id },
    { condition: 'c.type = "radar"' },
  ]
  if (style) conditions.push({ condition: 'c.playStyle = @', value: style })

  const result = await fetchList(
    'UserDetails',
    ['playStyle', 'stream', 'voltage', 'air', 'freeze', 'chaos'],
    conditions,
    { playStyle: 'ASC' }
  )
  return result.length
    ? result
    : ([
        { playStyle: 1, ...radar },
        { playStyle: 2, ...radar },
      ] as GrooveRadarInfo[])
})
