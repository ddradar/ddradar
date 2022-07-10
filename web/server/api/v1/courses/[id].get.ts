import type { Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { fetchOne } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'
import { createError, sendError } from 'h3'

import { addCORSHeader } from '~/server/auth'

export type CourseInfo = Database.CourseSchema

/**
 * Get course and orders information that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v1/courses/:id`
 *   - `id`: {@link CourseInfo.id}
 * @param event HTTP Event
 * @returns
 * - Returns `400 Bad Request` if {@link CourseInfo.id id} is invalid.
 * - Returns `404 Not Found` if no song that matches {@link CourseInfo.id id}.
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
export default async (event: CompatibilityEvent) => {
  addCORSHeader(event)
  const id: unknown = event.context.params.id
  if (typeof id !== 'string' || !Song.isValidId(id)) {
    sendError(event, createError({ statusCode: 400 }))
    return null
  }

  const course = (await fetchOne(
    'Songs',
    [
      'id',
      'name',
      'nameKana',
      'nameIndex',
      'series',
      'minBPM',
      'maxBPM',
      'deleted',
      'charts',
    ],
    { condition: 'c.id = @', value: id },
    { condition: 'c.nameIndex <= 0' }
  )) as CourseInfo | null

  if (!course) {
    sendError(event, createError({ statusCode: 404 }))
  }
  return course
}
