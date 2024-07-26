import { danceLevelSet } from '@ddradar/core'
import type { Condition } from '@ddradar/db'
import { fetchList } from '@ddradar/db'

import type { RankStatus } from '~~/schemas/users'
import { getRankQuerySchema as schema } from '~~/schemas/users'

const danceLevels: string[] = [...danceLevelSet]

/**
 * Get Score statuses that match the specified userId, {@link RankStatus.playStyle playStyle} and {@link RankStatus.level level}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/:id/score?style=:style&lv=:lv`
 *   - `id`: UserSchema.id
 *   - `style`(optional): {@link RankStatus.playStyle}
 *   - `lv`(optional): {@link RankStatus.level}
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
export default defineEventHandler(async event => {
  const user = await getUser(event)
  const { style, lv } = await getValidatedQuery(event, schema.parse)

  const conditions: Condition<'UserDetails'>[] = []
  if (style) conditions.push({ condition: 'c.playStyle = @', value: style })
  if (lv) conditions.push({ condition: 'c.level = @', value: lv })

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
})
