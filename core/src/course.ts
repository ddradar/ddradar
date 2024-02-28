import { z } from 'zod'

import type { Course, CourseChart, CourseOrder } from './graphql'
import { songSchema, stepChartSchema } from './song'

/** zod schema object for {@link CourseOrderSchema}. */
export const courseOrderSchema = stepChartSchema
  .pick({ playStyle: true, difficulty: true, level: true })
  .extend({
    songId: songSchema.shape.id,
    songName: songSchema.shape.name,
  }) satisfies z.ZodType<CourseOrder>
/** Course order */
export type CourseOrderSchema = CourseOrder & z.infer<typeof courseOrderSchema>

/** zod schema object for {@link CourseChartSchema}. */
export const courseChartSchema = stepChartSchema
  .pick({
    playStyle: true,
    difficulty: true,
    level: true,
    notes: true,
    freezeArrow: true,
    shockArrow: true,
  })
  .extend({
    order: z.array(courseOrderSchema),
  }) satisfies z.ZodType<CourseChart>
/** Course difficulty */
export type CourseChartSchema = Omit<CourseChart, 'order'> &
  z.infer<typeof courseChartSchema>

/** zod schema object for {@link CourseSchema}. */
export const courseSchema = songSchema
  .pick({
    id: true,
    name: true,
    nameKana: true,
    series: true,
    minBPM: true,
    maxBPM: true,
    deleted: true,
  })
  .extend({
    nameIndex: z.union([z.literal(-1), z.literal(-2)]),
    charts: z.array(courseChartSchema),
  }) satisfies z.ZodType<Course>
/**
 * DB Schema of Course data (included on 'Songs' container)
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
export type CourseSchema = Omit<Course, 'charts'> & z.infer<typeof courseSchema>
