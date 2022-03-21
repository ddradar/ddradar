import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

type SongListData = Api.SongListData

/**
 * Get a list of song information that matches the specified conditions.
 * @description
 * - No need Authentication.
 * - `GET /api/v1/songs?name=:name&series=:series`
 *   - `name`(optional): {@link SongListData.nameIndex}
 *   - `series`(optional): `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param songs Song data (from Cosmos DB input binding)
 * @returns
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
  /** {@link SongListData.nameIndex} (optional) */
  const name = parseFloat(req.query.name ?? '')
  /** `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3 (optional) */
  const series = parseFloat(req.query.series ?? '')
  const isValidName = Number.isInteger(name) && name >= 0 && name <= 36
  const isValidSeries =
    Number.isInteger(series) && series >= 0 && series < Song.seriesSet.size

  const body = songs.filter(
    s =>
      (!isValidName || s.nameIndex === name) &&
      (!isValidSeries || s.series === [...Song.seriesSet][series])
  )

  if (body.length === 0) return new ErrorResult(404)

  return new SuccessResult(body)
}
