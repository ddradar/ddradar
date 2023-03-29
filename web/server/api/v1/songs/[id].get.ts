import type { Database } from '@ddradar/core'

import { callGraphQL } from '~~/server/utils/graphQL'
import { sendNullWithError } from '~~/server/utils/http'
import { isValidSongId } from '~~/utils/song'

export type SongInfo = Omit<Database.SongSchema, 'skillAttackId'>

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

  /* GraphQL */
  const query = `
  query getById($id: ID!) {
    song_by_pk(id: $id) {
      id
      name
      nameKana
      nameIndex
      artist
      series
      minBPM
      maxBPM
      charts {
        playStyle
        difficulty
        level
        notes
        freezeArrow
        shockArrow
        stream
        voltage
        air
        freeze
        chaos
      }
      deleted
    }
  }`
  const song = await callGraphQL<{ song_by_pk: SongInfo }>(query, { id })

  return song.data?.song_by_pk ?? sendNullWithError(event, 404)
})
