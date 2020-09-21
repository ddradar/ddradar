import type { HttpRequest } from '@azure/functions'

import { CourseSchema, fetchCourseList, StepChartSchema } from '../db/songs'
import type { SuccessResult } from '../function'

type CourseListData = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>[]
}

/** Get course information list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>
): Promise<SuccessResult<CourseListData[]>> {
  // Parse search query
  const type = parseFloat(req.query.type)
  const series = parseFloat(req.query.series)
  const isValidType = type === 1 || type === 2
  const isValidSeries = series === 16 || series === 17

  const body = await fetchCourseList(
    isValidType ? type * -1 : undefined,
    isValidSeries ? series : undefined
  )

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
