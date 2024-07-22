import { queryContainer } from '@ddradar/db'

import { seriesNames } from '~~/app/utils/song'
import { getListQuerySchema as schema } from '~~/schemas/song'

/**
 * Get a list of song information that matches the specified conditions.
 * @description
 * - No need Authentication.
 * - GET `/api/v1/songs?name=:name&series=:series`
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

  const { resources } = await queryContainer(
    getCosmosClient(event),
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
    ],
    [
      ...(typeof name === 'number'
        ? ([{ condition: 'c.nameIndex = @', value: name }] as const)
        : []),
      ...(typeof series === 'number'
        ? ([{ condition: 'c.series = @', value: seriesNames[series] }] as const)
        : []),
    ]
  ).fetchAll()
  return resources
})
