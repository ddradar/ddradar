import type { Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { fetchJoinedList } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'

import { sendNullWithError } from '~/server/utils'

export type ChartInfo = Pick<Database.SongSchema, 'id' | 'name' | 'series'> &
  Pick<Database.StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

/**
 * Get charts that match the specified conditions.
 * @description
 * - No need Authentication.
 * - GET `/api/v1/charts/[style]/[level]`
 *   - `style`: {@link ChartInfo.playStyle}
 *   - `level`: {@link ChartInfo.level}
 * @param event HTTP Event
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
export default async (event: CompatibilityEvent) => {
  const style: number = parseInt(event.context.params.style, 10)
  const level: number = parseInt(event.context.params.level, 10)

  if (!Song.isPlayStyle(style) || !(level >= 1 && level <= 20)) {
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
}