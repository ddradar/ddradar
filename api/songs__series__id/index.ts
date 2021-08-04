import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

type SongListData = Api.SongListData

/**
 * Get a list of song information that matches the specified conditions.
 * @description
 * - No need Authentication.
 * - `GET /api/v1/songs/series/:series&name=:name`
 *   - `series`: `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `17`: Dance Dance Revolution A20 PLUS
 *   - `name`(optional): {@link SongListData.nameIndex}
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param songs Song data (from Cosmos DB input binding)
 * @returns
 * - Returns `404 Not Found` if `series` is undefined or invalid type.
 *   - If `name` is invalid, it is ignored.
 * - Returns `404 Not Found` if no song that matches conditions.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   {
 *     "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *     "name": "イーディーエム・ジャンパーズ",
 *     "nameKana": "いーでぃーえむ じゃんぱーず",
 *     "nameIndex": 0,
 *     "artist": "かめりあ feat. ななひら",
 *     "series": "DanceDanceRevolution A",
 *     "minBPM": 72,
 *     "maxBPM": 145
 *   }
 * ]
 * ```
 */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  songs: SongListData[]
): Promise<ErrorResult<404> | SuccessResult<SongListData[]>> {
  const name = parseFloat(req.query.name ?? '')
  const isValidName = Number.isInteger(name) && name >= 0 && name <= 36

  const body = songs.filter(s => !isValidName || s.nameIndex === name)

  if (body.length === 0) return new ErrorResult(404)

  return new SuccessResult(body)
}
