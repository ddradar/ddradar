import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'
import { Song } from '@ddradar/core'

import { SuccessResult } from '../function'

type CourseListDocument = Api.CourseListData &
  Pick<Database.CourseSchema, 'nameIndex'>

/**
 * Get course information list.
 * @description
 * - No need Authentication.
 * - `GET api/v1/courses?series=:series&type=:type`
 *   - `series`(optional): `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3
 *   - `type`(optional): `1`: NONSTOP, `2`: 段位認定
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param documents Course data (from Cosmos DB input binding)
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
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  documents: ReadonlyArray<CourseListDocument>
): Promise<SuccessResult<Api.CourseListData[]>> {
  // Parse search query
  /** `1`: NONSTOP, `2`: 段位認定 (optional) */
  const type = parseFloat(req.query.type ?? '')
  /** `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3 (optional) */
  const series = parseFloat(req.query.series ?? '')
  const isValidType = type === 1 || type === 2
  const isValidSeries =
    Number.isInteger(series) && series >= 0 && series < Song.seriesSet.size

  const courses = documents
    .filter(
      c =>
        (!isValidType || c.nameIndex === -1 * type) &&
        (!isValidSeries || c.series === [...Song.seriesSet][series])
    )
    .map(c => ({ id: c.id, name: c.name, series: c.series, charts: c.charts }))

  return new SuccessResult(courses)
}
