import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

type SongInfo = Api.SongInfo

/**
 * Get song and charts information that match the specified ID.
 * @description
 * - `GET api/v1/songs/:id`
 * - No need Authentication.
 * @param bindingData.id {@link SongInfo.id}
 * @param _req HTTP Request (unused)
 * @param song Song data (from Cosmos DB binding)
 * @returns
 * - Returns `404 Not Found` if no song that matches {@link SongInfo.id}.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * {
 *   "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *   "name": "イーディーエム・ジャンパーズ",
 *   "nameKana": "いーでぃーえむ じゃんぱーず",
 *   "nameIndex": 0,
 *   "artist": "かめりあ feat. ななひら",
 *   "series": "DanceDanceRevolution A",
 *   "minBPM": 72,
 *   "maxBPM": 145,
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0,
 *       "stream": 12,
 *       "voltage": 11,
 *       "air": 1,
 *       "freeze": 20,
 *       "chaos": 0
 *     }
 *   ]
 * }
 * ```
 */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [song]: SongInfo[]
): Promise<ErrorResult<404> | SuccessResult<SongInfo>> {
  if (!song) {
    return new ErrorResult(404, `Not found song that id: "${bindingData.id}"`)
  }

  return new SuccessResult(song)
}
