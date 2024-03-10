import { getListQuerySchema as schema, type SongListData } from '~/schemas/song'
import { seriesNames } from '~/utils/song'

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

  const query = /* GraphQL */ `
    query(
      ${typeof name === 'number' ? '$name: Int!' : ''}
      ${typeof series === 'number' ? '$series: String!' : ''}
      $cursor: String
    ) {
      songs(
        filter: {
          and: [
            { nameIndex: { gte: 0 } }
            ${typeof name === 'number' ? '{ nameIndex: { eq: $name } }' : ''}
            ${typeof series === 'number' ? '{ series: { eq: $series } }' : ''}
          ]
        }
        after: $cursor
        orderBy: { nameIndex: ASC, nameKana: ASC }
      ) {
        items {
          id
          name
          nameKana
          nameIndex
          artist
          series
          minBPM
          maxBPM
          deleted
        }
        hasNextPage
        endCursor
      }
    }
    `

  return await $graphqlList<SongListData>(event, query, 'songs', {
    ...(typeof name === 'number' ? { name } : {}),
    ...(typeof series === 'number' ? { series: seriesNames[series] } : {}),
  })
})
