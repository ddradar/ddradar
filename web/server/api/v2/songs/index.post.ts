import type { DBSongSchema } from '@ddradar/db'

import { postBodySchema } from '~~/schemas/songs'

/**
 * Add or update song and charts information.
 * @description
 * - Need Authentication with `administrator` role.
 * - POST `/api/v2/songs`
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
 *   "artist": "かめりあ feat. ななひら",
 *   "series": "DanceDanceRevolution A",
 *   "folders": [],
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0
 *     }
 *   ]
 * }
 * ```
 */
export default defineEventHandler(async event => {
  if (!hasRole(event, 'administrator')) throw createError({ statusCode: 401 })

  const body = await readValidatedBody(event, postBodySchema.parse)

  const song: DBSongSchema = {
    id: body.id,
    type: 'song',
    name: body.name,
    nameKana: body.nameKana,
    artist: body.artist,
    series: body.series,
    folders: body.folders,
    charts: [...body.charts].sort((l, r) =>
      l.playStyle === r.playStyle
        ? l.difficulty - r.difficulty
        : l.playStyle - r.playStyle
    ),
    ...(body.deleted ? { deleted: true } : {}),
  }
  await getSongRepository(event).upsert(song)

  return song
})
