import { Database, Song } from '@ddradar/core'
import { fetchList } from '@ddradar/db'
import { CompatibilityEvent, useQuery } from 'h3'

import { getLoginUserInfo, useClientPrincipal } from '~/server/auth'

export type ScoreInfo = Omit<
  Database.ScoreSchema,
  'isPublic' | 'radar' | 'deleted'
>

/**
 * Get scores that match the specified chart.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/scores/:id/:style/:diff?scope=:scope`
 *   - `scope`(optional): `private`: Only personal best score, `medium`(default): Personal best, area top, and world top scores, `full`: All scores
 *   - `id`: {@link ScoreInfo.songId}
 *   - `style`: {@link ScoreInfo.playStyle}
 *   - `diff`: {@link ScoreInfo.difficulty}
 * @param event HTTP Event
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
export default async (event: CompatibilityEvent) => {
  // route params
  const id: string = event.context.params.id
  const style = parseFloat(event.context.params.style)
  const diff = parseFloat(event.context.params.diff)
  if (
    !Song.isValidSongId(id) ||
    !Song.isPlayStyle(style) ||
    !Song.isDifficulty(diff)
  ) {
    event.res.statusCode = 404
    return []
  }

  // query
  const query = useQuery(event)
  /**
   * `private`: Only personal best score
   * `medium`(default): Personal best, area top, and world top scores
   * `full`: All scores
   */
  const scope = ['private', 'medium', 'full'].includes(
    query.scope?.toString() ?? ''
  )
    ? (query.scope as 'private' | 'medium' | 'full')
    : 'medium'

  const user = await getLoginUserInfo(useClientPrincipal(event))
  if (scope === 'private' && !user) {
    event.res.statusCode = 404
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
    event.res.statusCode = 404
    return []
  }
  return scores
}
