import { Database } from '@ddradar/core'
import { Condition, fetchList } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'
import { useQuery } from 'h3'

import { tryFetchUser } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'
import { getQueryInteger } from '~/src/path'

const danceLevels: string[] = [...Database.danceLevelSet]

export type RankStatus = Pick<
  Database.ScoreStatusSchema,
  'playStyle' | 'level' | 'count'
> & {
  /** Dance level (`"E"` ~ `"AAA"`), `"-"`: No Play */
  rank: Database.DanceLevel | '-'
}

/**
 * Get Score statuses that match the specified {@link Database.UserSchema.id userId}, {@link RankStatus.playStyle playStyle} and {@link RankStatus.level level}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/:id/score?style=:style&lv=:lv`
 *   - `id`: {@link Database.UserSchema.id}
 *   - `style`(optional): {@link RankStatus.playStyle}
 *   - `lv`(optional): {@link RankStatus.level}
 * @param event HTTP Event
 * @returns
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   { "playStyle": 1, "level": 1, "rank": "-", "count": 20 },
 *   { "playStyle": 1, "level": 1, "rank": "AA+", "count": 10 },
 *   { "playStyle": 1, "level": 1, "rank": "AAA", "count": 20 }
 * ]
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const user = await tryFetchUser(event)
  if (!user) return sendNullWithError(event, 404)

  const query = useQuery(event)
  const style = getQueryInteger(query, 'style')
  const lv = getQueryInteger(query, 'lv')

  const conditions: Condition<'UserDetails'>[] = []
  if (Database.isPlayStyle(style)) {
    conditions.push({ condition: 'c.playStyle = @', value: style })
  }
  if (lv >= 1 && lv <= 20) {
    conditions.push({ condition: 'c.level = @', value: lv })
  }

  /** User Score Statuses */
  const clears = (await fetchList(
    'UserDetails',
    ['playStyle', 'level', 'rank', 'count'],
    [
      { condition: 'c.userId = @', value: user.id },
      { condition: 'c.type = "score"' },
      ...conditions,
    ],
    { playStyle: 'ASC' }
  )) as RankStatus[]
  /** Chart total counts */
  const total = (await fetchList(
    'UserDetails',
    ['playStyle', 'level', 'count'],
    [{ condition: 'c.userId = "0"' }, ...conditions],
    { playStyle: 'ASC' }
  )) as Omit<RankStatus, 'rank'>[]

  return total
    .flatMap(d => {
      const filtered = clears.filter(
        r => r.playStyle === d.playStyle && r.level === d.level
      )
      const playedCount = filtered.reduce((p, c) => p + c.count, 0)
      return [
        ...filtered,
        { ...d, rank: '-' as const, count: d.count - playedCount },
      ]
    })
    .sort((l, r) =>
      l.playStyle !== r.playStyle
        ? l.playStyle - r.playStyle
        : l.level !== r.level
        ? l.level - r.level
        : danceLevels.indexOf(l.rank) - danceLevels.indexOf(r.rank)
    ) // ORDER BY playStyle, level, rank ASC
}
