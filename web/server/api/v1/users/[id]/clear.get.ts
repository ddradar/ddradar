import type { ClearLamp, UserClearLampSchema } from '@ddradar/core'
import { playStyleMap } from '@ddradar/core'
import { Condition, fetchList } from '@ddradar/db'
import { getQuery } from 'h3'

import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { getQueryInteger } from '~~/utils/path'

export type ClearStatus = Pick<
  UserClearLampSchema,
  'playStyle' | 'level' | 'count'
> & {
  /**
   * `-1`: No Play,
   * `0`: Failed,
   * `1`: Assisted Clear,
   * `2`: Clear,
   * `3`: LIFE4,
   * `4`: Good FC (Full Combo),
   * `5`: Great FC,
   * `6`: PFC,
   * `7`: MFC
   */
  clearLamp: ClearLamp | -1
}

/**
 * Get Clear status that match the specified `userId`, {@link ClearStatus.playStyle playStyle} and {@link ClearStatus.level level}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users/:id/clear?style=:style&lv=:lv`
 *   - `id`: `UserSchema.id`
 *   - `style`(optional): {@link ClearStatus.playStyle}
 *   - `lv`(optional): {@link ClearStatus.level}
 * @param event HTTP Event
 * @returns
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   { "playStyle": 1, "level": 1, "clearLamp": -1, "count": 10 },
 *   { "playStyle": 1, "level": 1, "clearLamp": 6, "count": 10 },
 *   { "playStyle": 1, "level": 1, "clearLamp": 7, "count": 20 }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const user = await tryFetchUser(event)
  if (!user) return sendNullWithError(event, 404)

  const query = getQuery(event)
  const style = getQueryInteger(query, 'style')
  const lv = getQueryInteger(query, 'lv')

  const conditions: Condition<'UserDetails'>[] = []
  if (playStyleMap.has(style)) {
    conditions.push({ condition: 'c.playStyle = @', value: style })
  }
  if (lv >= 1 && lv <= 20) {
    conditions.push({ condition: 'c.level = @', value: lv })
  }

  /** User Clear Statuses */
  const clears = (await fetchList(
    'UserDetails',
    ['playStyle', 'level', 'clearLamp', 'count'],
    [
      { condition: 'c.userId = @', value: user.id },
      { condition: 'c.type = "clear"' },
      ...conditions,
    ],
    { playStyle: 'ASC' }
  )) as ClearStatus[]
  /** Chart total counts */
  const total = (await fetchList(
    'UserDetails',
    ['playStyle', 'level', 'count'],
    [{ condition: 'c.userId = "0"' }, ...conditions],
    { playStyle: 'ASC' }
  )) as Omit<ClearStatus, 'clearLamp'>[]

  return total
    .flatMap(d => {
      const filtered = clears.filter(
        r => r.playStyle === d.playStyle && r.level === d.level
      )
      const playedCount = filtered.reduce((p, c) => p + c.count, 0)
      return [
        ...filtered,
        { ...d, clearLamp: -1 as const, count: d.count - playedCount },
      ]
    })
    .sort((l, r) =>
      l.playStyle !== r.playStyle
        ? l.playStyle - r.playStyle
        : l.level !== r.level
          ? l.level - r.level
          : l.clearLamp - r.clearLamp
    ) // ORDER BY playStyle, level, clearLamp ASC
})
