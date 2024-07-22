import { getRouterParamsSchema as schema } from '~~/schemas/songs'

/**
 * Get song and charts information that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v2/songs/[id]`
 *   - `id`: Song ID
 * @returns
 * - Returns `400 Bad Request` if `id` is invalid.
 * - Returns `404 Not Found` if no song that matches `id`.
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
 *   "folders": [
 *     { "type": "category", "name": "WHITE" },
 *     { "type": "name", "name": "あ" },
 *     { "type": "series", "name": "A" }
 *   ],
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "bpm": [72, 145, 145],
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0
 *     }
 *   ],
 *   "skillAttackId": 675
 * }
 * ```
 */
export default defineEventHandler(async event => {
  const { id } = await getValidatedRouterParams(event, schema.parse)

  const song = await getSongRepository(event).get(id)
  if (!song) throw createError({ statusCode: 404 })

  return song
})
