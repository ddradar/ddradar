import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { fetchOne } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'

export type SongInfo = Api.SongInfo

/**
 * Get song and charts information that match the specified ID.
 * @description
 * - No need Authentication.
 * - `GET api/v2/songs/:id`
 *   - `id`: {@link SongInfo.id}
 * @param event HTTP Event
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
export default async (event: CompatibilityEvent) => {
  const id: unknown = event.context.params.id
  if (typeof id !== 'string' || !Song.isValidId(id)) {
    event.res.statusCode = 400
    return null
  }

  const song = (await fetchOne(
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
  )) as SongInfo

  if (!song) {
    event.res.statusCode = 404
    return null
  }
  return song
}
