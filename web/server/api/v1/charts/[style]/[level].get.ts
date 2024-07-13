import { fetchJoinedList } from '@ddradar/db'

import type { ChartInfo } from '~~/schemas/song'
import { getChartsRouterParamsSchema as schema } from '~~/schemas/song'

/**
 * Get charts that match the specified conditions.
 * @description
 * - No need Authentication.
 * - GET `/api/v1/charts/[style]/[level]`
 *   - `style`: {@link ChartInfo.playStyle}
 *   - `level`: {@link ChartInfo.level}
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *     "name": "イーディーエム・ジャンパーズ",
 *     "series": "DanceDanceRevolution A",
 *     "playStyle": 1,
 *     "difficulty": 3,
 *     "level": 12
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { style, level } = await getValidatedRouterParams(event, schema.parse)

  return await fetchJoinedList<'Songs', ChartInfo>(
    'Songs',
    ['c.id', 'c.name', 'c.series', 'i.playStyle', 'i.difficulty', 'i.level'],
    'charts',
    [
      { condition: 'c.nameIndex NOT IN (-1, -2)' },
      { condition: 'i.playStyle = @', value: style },
      { condition: 'i.level = @', value: level },
    ],
    { nameIndex: 'ASC', nameKana: 'ASC' }
  )
})
