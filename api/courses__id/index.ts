import type { Context } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

type CourseSchema = Database.CourseSchema

/**
 * Get course and orders information that match the specified ID.
 * @description
 * - `GET api/v1/courses/:id`
 * - No need Authentication.
 * @param bindingData.id {@link CourseSchema.id}
 * @param _req HTTP Request (unused)
 * @param course Course data (from Cosmos DB binding)
 * @returns
 * - Returns `404 Not Found` if no course that matches `id`.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * {
 *   "id": "qbbOOO1QibO1861bqQII9lqlPiIoqb98",
 *   "name": "FIRST",
 *   "nameKana": "C-A20-1",
 *   "nameIndex": -1,
 *   "series": "DanceDanceRevolution A20",
 *   "minBPM": 119,
 *   "maxBPM": 180,
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "level": 4,
 *       "notes": 401,
 *       "freezeArrow": 8,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 2
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 3
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 3
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 4
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [course]: CourseSchema[]
): Promise<ErrorResult<404> | SuccessResult<Api.CourseInfo>> {
  if (!course) {
    return new ErrorResult(404, `Not found course that id: "${bindingData.id}"`)
  }

  return new SuccessResult(course)
}
