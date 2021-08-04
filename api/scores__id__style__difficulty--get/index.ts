import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type ScoreSchema = Database.ScoreSchema

/**
 * Get scores that match the specified chart.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/scores/:songId/:playStyle/:difficulty?scope=:scope`
 *   - `scope`(optional): `private`: Only personal best score, `medium`(default): Personal best, area top, and world top scores, `full`: All scores
 *   - `songId`: {@link ScoreSchema.songId}
 *   - `playStyle`: {@link ScoreSchema.playStyle}
 *   - `difficulty`: {@link ScoreSchema.difficulty}
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param scores
 * Score data that matches {@link ScoreSchema.songId songId}, {@link ScoreSchema.playStyle playStyle} and {@link ScoreSchema.difficulty difficulty}. (from Cosmos DB input binding)
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
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  scores: ScoreSchema[]
): Promise<ErrorResult<404> | SuccessResult<Api.ScoreInfo[]>> {
  /**
   * `private`: Only personal best score
   * `medium`(default): Personal best, area top, and world top scores
   * `full`: All scores
   */
  const scope = ['private', 'medium', 'full'].includes(req.query.scope ?? '')
    ? (req.query.scope as 'private' | 'medium' | 'full')
    : 'medium'

  const user = await getLoginUserInfo(getClientPrincipal(req))

  if (scope === 'private' && !user) return new ErrorResult(404)

  /**
   * private: `[user.id]`
   * medium, full: `[user.id, '0', user.area]`
   */
  const userIds = [
    user?.id,
    ...(scope !== 'private' ? ['0', `${user?.area ?? ''}`] : []),
  ].filter(u => u)

  const body = scores
    .filter(s => userIds.includes(s.userId) || (scope === 'full' && s.isPublic))
    .map<Api.ScoreInfo>(s => ({
      userId: s.userId,
      userName: s.userName,
      songId: s.songId,
      songName: s.songName,
      playStyle: s.playStyle,
      difficulty: s.difficulty,
      level: s.level,
      score: s.score,
      clearLamp: s.clearLamp,
      rank: s.rank,
      ...(s.maxCombo !== undefined ? { maxCombo: s.maxCombo } : {}),
      ...(s.exScore !== undefined ? { exScore: s.exScore } : {}),
    }))

  if (body.length === 0) return new ErrorResult(404)

  return new SuccessResult(body)
}
