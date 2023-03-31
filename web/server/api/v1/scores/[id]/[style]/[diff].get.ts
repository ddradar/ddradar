import { fetchList } from '@ddradar/db'
import type { ScoreSchema } from '@ddradar/db-definitions'
import {
  difficultyMap,
  isValidSongId,
  playStyleMap,
} from '@ddradar/db-definitions'
import { getQuery } from 'h3'

import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { getQueryString } from '~~/utils/path'

export type ScoreInfo = Omit<ScoreSchema, 'isPublic' | 'radar' | 'deleted'>

/**
 * Get scores that match the specified chart.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/scores/:id/:style/:diff?scope=:scope`
 *   - `scope`(optional): `private`: Only personal best score, `medium`(default): Personal best, area top, and world top scores, `full`: All scores
 *   - `id`: {@link ScoreInfo.songId}
 *   - `style`: {@link ScoreInfo.playStyle}
 *   - `diff`: {@link ScoreInfo.difficulty}
 * @returns
 * - Returns `404 Not Found` if parameters are invalid.
 * - Returns `404 Not Found` if no score that matches parameters.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```json
 * [
 *   {
 *     "userId": "0",
 *     "userName": "0",
 *     "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "songName": "愛言葉",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "score": 1000000,
 *     "exScore": 402,
 *     "maxCombo": 122,
 *     "clearLamp": 7,
 *     "rank": "AAA"
 *   },
 *   {
 *     "userId": "13",
 *     "userName": "13",
 *     "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "songName": "愛言葉",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "score": 999980,
 *     "exScore": 400,
 *     "maxCombo": 122,
 *     "clearLamp": 6,
 *     "rank": "AAA"
 *   },
 *   {
 *     "userId": "public_user",
 *     "userName": "AFRO",
 *     "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "songName": "愛言葉",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "score": 999950,
 *     "clearLamp": 6,
 *     "rank": "AAA"
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  // route params
  const id: string = event.context.params!.id
  const style = parseFloat(event.context.params!.style)
  const diff = parseFloat(event.context.params!.diff)
  if (
    !isValidSongId(id) ||
    !playStyleMap.has(style) ||
    !difficultyMap.has(diff)
  ) {
    sendNullWithError(event, 404)
    return []
  }

  // query
  const queryValue = getQueryString(getQuery(event), 'scope') ?? 'medium'
  /**
   * `private`: Only personal best score
   * `medium`(default): Personal best, area top, and world top scores
   * `full`: All scores
   */
  const scope = ['private', 'medium', 'full'].includes(queryValue)
    ? (queryValue as 'private' | 'medium' | 'full')
    : 'medium'

  const user = await getLoginUserInfo(event)
  if (scope === 'private' && !user) {
    sendNullWithError(event, 404)
    return []
  }

  /**
   * private: `[user.id]`
   * medium, full: `[user.id, '0', user.area]`
   */
  const userIds = [
    user?.id,
    ...(scope !== 'private' ? ['0', `${user?.area ?? ''}`] : []),
  ].filter((u): u is string => !!u)

  const scores: ScoreInfo[] = await fetchList(
    'Scores',
    [
      'userId',
      'userName',
      'songId',
      'songName',
      'playStyle',
      'difficulty',
      'level',
      'score',
      'clearLamp',
      'rank',
      'maxCombo',
      'exScore',
    ],
    [
      { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
      { condition: 'c.songId = @', value: id },
      { condition: 'c.playStyle = @', value: style },
      { condition: 'c.difficulty = @', value: diff },
      {
        condition: `(ARRAY_CONTAINS(@, c.userId)${
          scope === 'full' ? ' OR c.isPublic' : ''
        })`,
        value: userIds,
      },
    ],
    { score: 'DESC', clearLamp: 'DESC', _ts: 'ASC' }
  )

  if (scores.length === 0) {
    sendNullWithError(event, 404)
    return []
  }
  return scores
})
