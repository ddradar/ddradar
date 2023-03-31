import { fetchScoreList } from '@ddradar/db'
import type { ScoreSchema } from '@ddradar/db-definitions'
import {
  clearLampMap,
  danceLevelSet,
  difficultyMap,
  playStyleMap,
} from '@ddradar/db-definitions'
import { getQuery } from 'h3'

import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { getQueryInteger, getQueryString } from '~~/utils/path'

export type ScoreList = Omit<
  ScoreSchema,
  'userId' | 'userName' | 'isPublic' | 'radar'
> & {
  /** Course score or not */
  isCourse: boolean
}

/**
 * Get user scores that match the specified conditions.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/[id]/scores?style=:style&diff=:diff&level=:level&lamp=:lamp&rank=:rank`
 *   - `id`: {@link ScoreSchema.userId}
 *   - `style`(optional): {@link ScoreList.playStyle}
 *   - `diff`(optional): {@link ScoreList.difficulty}
 *   - `level`(optional): {@link ScoreList.level}
 *   - `lamp`(optional): {@link ScoreList.clearLamp}
 *   - `rank`(optional): {@link ScoreList.rank}
 * @param event HTTP Event
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "songName": "愛言葉",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 3,
 *     "score": 999950,
 *     "clearLamp": 6,
 *     "rank": "AAA",
 *     "isCourse": false
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const user = await tryFetchUser(event)
  if (!user) return sendNullWithError(event, 404)

  const query = getQuery(event)
  const playStyle = getQueryInteger(query, 'style')
  const difficulty = getQueryInteger(query, 'diff')
  const level = getQueryInteger(query, 'level')
  const clearLamp = getQueryInteger(query, 'lamp')
  const rank = getQueryString(query, 'rank')

  const conditions = {
    ...(playStyleMap.has(playStyle) ? { playStyle } : {}),
    ...(difficultyMap.has(difficulty) ? { difficulty } : {}),
    ...(level >= 1 && level <= 20 ? { level } : {}),
    ...(clearLampMap.has(clearLamp) ? { clearLamp } : {}),
    ...(danceLevelSet.has(rank) ? { rank } : {}),
  } as Partial<
    Pick<
      ScoreSchema,
      'playStyle' | 'difficulty' | 'level' | 'clearLamp' | 'rank'
    >
  >

  return (await fetchScoreList(user.id, conditions)).map<ScoreList>(d => {
    const r = { ...d, isCourse: !d.radar }
    delete r.radar
    return r
  })
})
