import type { HttpRequest } from '@azure/functions'

import { CourseInfoSchema, CourseSchema, seriesSet } from '../core/db/songs'
import { SuccessResult } from '../function'

type CourceChartInfo = Pick<
  CourseInfoSchema,
  'playStyle' | 'difficulty' | 'level'
>
type CourseListDocument = Pick<
  CourseSchema,
  'id' | 'name' | 'series' | 'nameIndex'
> & {
  charts: ReadonlyArray<CourceChartInfo>
}
type CourseListResult = Omit<CourseListDocument, 'nameIndex'>

/** Get course information list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  documents: ReadonlyArray<CourseListDocument>
): Promise<SuccessResult<CourseListResult[]>> {
  // Parse search query
  const type = parseFloat(req.query.type)
  const series = parseFloat(req.query.series)
  const isValidType = type === 1 || type === 2
  const isValidSeries = series === 16 || series === 17

  const courses = documents
    .filter(
      c =>
        (!isValidType || c.nameIndex === -1 * type) &&
        (!isValidSeries || c.series === [...seriesSet][series])
    )
    .map(c => ({ id: c.id, name: c.name, series: c.series, charts: c.charts }))

  return new SuccessResult(courses)
}
