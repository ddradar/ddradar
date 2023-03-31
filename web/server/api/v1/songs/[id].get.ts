import { fetchOne } from '@ddradar/db'
import type { SongSchema } from '@ddradar/db-definitions'

import { sendNullWithError } from '~~/server/utils/http'
import { isValidSongId } from '~~/utils/song'

export type SongInfo = Omit<SongSchema, 'skillAttackId'>

/**
 * Get song and charts information that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v1/songs/:id`
 *   - `id`: {@link SongInfo.id}
 * @returns
 * - Returns `400 Bad Request` if {@link SongInfo.id id} is invalid.
 * - Returns `404 Not Found` if no song that matches {@link SongInfo.id id}.
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
export default defineEventHandler(async event => {
  const id: string = event.context.params!.id
  if (!isValidSongId(id)) return sendNullWithError(event, 400)

  const song = await fetchOne(
    'Songs',
    [
      'id',
      'name',
      'nameKana',
      'nameIndex',
      'artist',
      'series',
      'minBPM',
      'maxBPM',
      'deleted',
      'charts',
    ],
    { condition: 'c.id = @', value: id },
    { condition: 'c.nameIndex != -1' },
    { condition: 'c.nameIndex != -2' }
  )

  return (song as SongInfo) ?? sendNullWithError(event, 404)
})
