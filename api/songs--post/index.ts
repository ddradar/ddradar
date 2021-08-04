import type { HttpRequest } from '@azure/functions'
import { Database } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

/** Return type of this function */
type PostSongResult = {
  /** HTTP output binding */
  httpResponse: ErrorResult<400> | SuccessResult<Database.SongSchema>
  /** Cosmos DB output binding */
  document?: Database.SongSchema
}

/**
 * Add or update song and charts information.
 * @description
 * - Need Authentication with `administrator` role.
 * - `POST /api/v1/songs`
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @returns
 * - Returns `401 Unauthorized` if user is not authenticated or does not have `administrator` role.
 * - Returns `400 BadRequest` if body parameters are invalid.
 * - Returns `200 OK` with updated JSON data if succeed add or update.
 * @example
 * ```jsonc
 * // Request Body & Response Body
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
  _context: unknown,
  req: Pick<HttpRequest, 'body'>
): Promise<PostSongResult> {
  if (!Database.isSongSchema(req.body)) {
    return { httpResponse: new ErrorResult(400) }
  }

  const document: Database.SongSchema = {
    id: req.body.id,
    name: req.body.name,
    nameKana: req.body.nameKana,
    nameIndex: req.body.nameIndex,
    artist: req.body.artist,
    series: req.body.series,
    minBPM: req.body.minBPM,
    maxBPM: req.body.maxBPM,
    ...(req.body.deleted ? { deleted: true } : {}),
    charts: [...req.body.charts].sort((l, r) =>
      l.playStyle === r.playStyle
        ? l.difficulty - r.difficulty
        : l.playStyle - r.playStyle
    ),
  }

  return { httpResponse: new SuccessResult(document), document }
}
