import type { Database } from '@ddradar/core'

import { callGraphQL } from '~~/server/utils/graphQL'
import { sendNullWithError } from '~~/server/utils/http'
import { isValidSongId } from '~~/utils/song'

export type CourseInfo = Database.CourseSchema

/**
 * Get course and orders information that match the specified ID.
 * @description
 * - No need Authentication.
 * - GET `api/v1/courses/:id`
 *   - `id`: {@link CourseInfo.id}
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
export default defineEventHandler(async event => {
  const id: string = event.context.params!.id
  if (!isValidSongId(id)) return sendNullWithError(event, 400)

  /* GraphQL */
  const query = `
  query getById($id: ID!) {
    course_by_pk(id: $id) {
      id
      name
      nameKana
      nameIndex
      series
      minBPM
      maxBPM
      charts {
        playStyle
        difficulty
        level
        notes
        freezeArrow
        shockArrow
        order {
          songId
          songName
          playStyle
          difficulty
          level
        }
      }
      deleted
    }
  }`
  const course = await callGraphQL<{ course_by_pk: CourseInfo }>(query, { id })

  return course.data?.course_by_pk ?? sendNullWithError(event, 404)
})
