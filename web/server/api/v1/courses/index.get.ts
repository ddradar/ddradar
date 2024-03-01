import {
  type CourseChartSchema,
  type CourseSchema,
  seriesSet,
} from '@ddradar/core'
import { type Condition, fetchList } from '@ddradar/db'
import { z } from 'zod'

export type CourseListData = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  /** Course difficulties (omitted) */
  charts: Pick<CourseChartSchema, 'playStyle' | 'difficulty' | 'level'>[]
}

const maxSeriesIndex = seriesSet.size
const seriesNames = [...seriesSet]

/** Expected queries */
const schema = z.object({
  series: z.coerce
    .number()
    .int()
    .min(0)
    .max(seriesSet.size - 1)
    .catch(-1),
  type: z.coerce.number().catch(0),
})

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

  const conditions: Condition<'Songs'>[] = [{ condition: 'c.nameIndex < 0' }]
  if (type === 1 || type === 2)
    conditions.push({ condition: 'c.nameIndex = @', value: type * -1 })
  if (series >= 0 && series < maxSeriesIndex) {
    conditions.push({ condition: 'c.series = @', value: seriesNames[series] })
  }

  const courses = await fetchList(
    'Songs',
    ['id', 'name', 'series', 'charts'],
    conditions,
    { nameIndex: 'ASC', nameKana: 'ASC' }
  )

  return courses.map<CourseListData>(c => ({
    id: c.id,
    name: c.name,
    series: c.series,
    charts: c.charts.map(s => ({
      playStyle: s.playStyle,
      difficulty: s.difficulty,
      level: s.level,
    })),
  }))
})
