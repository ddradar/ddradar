import { Database } from '@ddradar/core'
import { getContainer } from '@ddradar/db'
import { readBody } from 'h3'

import { sendNullWithError } from '~/server/utils'

/**
 * Add or update song and charts information.
 * @description
 * - Need Authentication with `administrator` role.
 * - POST `/api/v1/songs`
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
export default defineEventHandler(async event => {
  const body = await readBody(event)
  if (!Database.isSongSchema(body)) {
    return sendNullWithError(event, 400, 'Invalid Body')
  }

  const song: Database.SongSchema = {
    id: body.id,
    name: body.name,
    nameKana: body.nameKana,
    nameIndex: body.nameIndex,
    artist: body.artist,
    series: body.series,
    minBPM: body.minBPM,
    maxBPM: body.maxBPM,
    ...(body.deleted ? { deleted: true } : {}),
    charts: [...body.charts].sort((l, r) =>
      l.playStyle === r.playStyle
        ? l.difficulty - r.difficulty
        : l.playStyle - r.playStyle
    ),
  }
  await getContainer('Songs').items.upsert(song)

  return song
})
