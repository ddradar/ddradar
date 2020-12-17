import type { HttpRequest } from '@azure/functions'

import { CourseSchema, SeriesList, StepChartSchema } from '../core/db/songs'
import { SuccessResult } from '../function'

type CourseListData = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>[]
}

/** Get course information list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  documents: (CourseListData & Pick<CourseSchema, 'nameIndex'>)[]
): Promise<SuccessResult<CourseListData[]>> {
  // Parse search query
  const type = parseFloat(req.query.type)
  const series = parseFloat(req.query.series)
  const isValidType = type === 1 || type === 2
  const isValidSeries = series === 16 || series === 17

  const courses = documents
    .filter(
      c =>
        (!isValidType || c.nameIndex === -1 * type) &&
        (!isValidSeries || c.series === SeriesList[series])
    )
    .map(c => ({ id: c.id, name: c.name, series: c.series, charts: c.charts }))

  return new SuccessResult(courses)
}
