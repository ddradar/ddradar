import { Database, Song } from '@ddradar/core'
import { Condition, fetchList, fetchOne } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'
import { useQuery } from 'h3'

import { canReadUserData } from '~/server/auth'
import { getQueryInteger, sendNullWithError } from '~/server/utils'

const danceLevels: string[] = [...Database.danceLevelSet]

export type RankStatus = Pick<
  Database.ScoreStatusSchema,
  'playStyle' | 'level' | 'count'
> & {
  /** Dance level (`"E"` ~ `"AAA"`), `"-"`: No Play */
  rank: Database.DanceLevel | '-'
}

/**
 * Get Clear status that match the specified {@link Database.UserSchema.id userId}, {@link RankStatus.playStyle playStyle} and {@link RankStatus.level level}.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/:id/rank?style=:style&lv=:lv`
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
 *   { "playStyle": 1, "level": 1, "rank": "-", "count": 10 },
 *   { "playStyle": 1, "level": 1, "rank": 6, "count": 10 },
 *   { "playStyle": 1, "level": 1, "rank": 7, "count": 20 }
 * ]
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const id: string = event.context.params.id
  if (!Database.isValidUserId(id)) return sendNullWithError(event, 404)

  // Check user visibility
  const user = await fetchOne('Users', ['loginId', 'isPublic'], {
    condition: 'c.id = @',
    value: id,
  })
  if (!user || !canReadUserData(event, user)) {
    return sendNullWithError(event, 404)
  }

  const query = useQuery(event)
  const style = getQueryInteger(query, 'style')
  const lv = getQueryInteger(query, 'lv')

  const conditions: Condition<'UserDetails'>[] = []
  if (Song.isPlayStyle(style)) {
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
      { condition: 'c.userId = @', value: id },
      { condition: 'c.type = "score"' },
      ...conditions,
    ],
    { playStyle: 'ASC', level: 'ASC', clearLamp: 'ASC' }
  )) as RankStatus[]
  /** Chart total counts */
  const total = (await fetchList(
    'UserDetails',
    ['playStyle', 'level', 'count'],
    [{ condition: 'c.userId = "0"' }, ...conditions],
    { playStyle: 'ASC', level: 'ASC', clearLamp: 'ASC' }
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
    ) // ORDER BY playStyle, level, clearLamp ASC
}
