import { getRouterParamsSchema as schema, type SongInfo } from '~/schemas/song'

/**
 * Get song and charts information that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v1/songs/[id]`
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
  const variables = await getValidatedRouterParams(event, schema.parse)

  const query = /* GraphQL */ `
    query ($id: ID!) {
      song_by_pk(id: $id) {
        id
        name
        nameKana
        nameIndex
        artist
        series
        minBPM
        maxBPM
        deleted
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
      }
    }
  `
  const { song_by_pk: song } = await $graphql<{ song_by_pk: SongInfo | null }>(
    event,
    query,
    variables
  )
  if (!song || song.nameIndex < 0) throw createError({ statusCode: 404 })

  return song
})
