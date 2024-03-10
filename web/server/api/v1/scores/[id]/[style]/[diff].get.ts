import { fetchList } from '@ddradar/db'

import type { ScoreInfo } from '~/schemas/score'
import {
  getQuerySchema as querySchema,
  routerParamsSchema as paramSchema,
} from '~/schemas/score'
import { getLoginUserInfo } from '~/server/utils/auth'

/**
 * Get scores that match the specified chart.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/scores/[id]/[style]/[diff]?scope=:scope`
 *   - `scope`(optional): `private`: Only personal best score, `medium`(default): Personal best, area top, and world top scores, `full`: All scores
 *   - `id`: {@link ScoreInfo.songId}
 *   - `style`: {@link ScoreInfo.playStyle}
 *   - `diff`: {@link ScoreInfo.difficulty}
 * @returns
 * - Returns `404 Not Found` if parameters are invalid.
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
  const { id, style, diff } = await getValidatedRouterParams(
    event,
    paramSchema.parse
  )
  const { scope } = await getValidatedQuery(event, querySchema.parse)

  const user = await getLoginUserInfo(event)
  if (scope === 'private' && !user) {
    throw createError({
      statusCode: 404,
      message: '"private" scope must be logged in',
    })
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

  return scores
})
