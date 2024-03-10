import type { CourseListData } from '~/schemas/course'
import { getListQuerySchema as schema } from '~/schemas/course'
import { seriesNames } from '~/utils/song'

/**
 * Get course information list.
 * @description
 * - No need Authentication.
 * - `GET api/v1/courses?series=:series&type=:type`
 *   - `series`(optional): `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3
 *   - `type`(optional): `1`: NONSTOP, `2`: 段位認定
 * @returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "qbbOOO1QibO1861bqQII9lqlPiIoqb98",
 *     "name": "FIRST",
 *     "series": "Dance Dance Revolution A20",
 *     "charts": [
 *       { "playStyle": 1, "difficulty": 0, "level": 4 },
 *       { "playStyle": 2, "difficulty": 3, "level": 11 }
 *     ]
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { series, type } = await getValidatedQuery(event, schema.parse)

  const query = /* GraphQL */ `
  query(
    ${typeof type === 'number' ? '$type: Int!' : ''}
    ${typeof series === 'number' ? '$series: String!' : ''}
    $cursor: String
  ) {
    courses(
      filter: {
        and: [
          { nameIndex: { lt: 0 } }
          ${typeof type === 'number' ? '{ nameIndex: { eq: $type } }' : ''}
          ${typeof series === 'number' ? '{ series: { eq: $series } }' : ''}
        ]
      }
      after: $cursor
      orderBy: { nameIndex: ASC, nameKana: ASC }
    ) {
      items {
        id
        name
        series
        charts {
          playStyle
          difficulty
          level
        }
      }
      hasNextPage
      endCursor
    }
  }
  `

  return await $graphqlList<CourseListData>(event, query, 'courses', {
    ...(typeof type === 'number' ? { type: type * -1 } : {}),
    ...(typeof series === 'number' ? { series: seriesNames[series] } : {}),
  })
})
