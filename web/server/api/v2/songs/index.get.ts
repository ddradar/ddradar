import { seriesNames } from '~~/app/utils/song'
import { getListQuerySchema as schema } from '~~/schemas/songs'

/**
 * Get a list of song information that matches the specified conditions.
 * @description
 * - No need Authentication.
 * - GET `/api/v2/songs?name=:name&series=:series`
 *   - `name`(optional): {@link SongListData.nameIndex}
 *   - `series`(optional): `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3
 * @param event HTTP Event
 * @returns `200 OK` with JSON body.
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
export default defineEventHandler(async event => {
  const { name, series } = await getValidatedQuery(event, schema.parse)

  return await getSongRepository(event).list([
    ...(typeof name === 'number'
      ? [{ condition: 'c.cp_nameIndex = @', value: name } as const]
      : []),
    ...(typeof series === 'number'
      ? [{ condition: 'c.series = @', value: seriesNames[series] } as const]
      : []),
  ])
})
