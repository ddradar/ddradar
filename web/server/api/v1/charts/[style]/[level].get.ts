import type { SongSchema, StepChartSchema } from '@ddradar/core'
import { playStyleMap } from '@ddradar/core'
import { fetchJoinedList } from '@ddradar/db'

import { sendNullWithError } from '~~/server/utils/http'

export type ChartInfo = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

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
  const style: number = parseInt(event.context.params!.style, 10)
  const level: number = parseInt(event.context.params!.level, 10)

  if (!playStyleMap.has(style) || !(level >= 1 && level <= 20)) {
    return sendNullWithError(event, 404)
  }

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
