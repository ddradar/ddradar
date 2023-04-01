import type { Course, CourseChart, CourseOrder } from './graphql'
import type { Difficulty, PlayStyle, Series } from './song'
import type { Strict } from './type-assert'

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
export type CourseSchema = Strict<
  Course,
  {
    /**
     * `-1`: NONSTOP, `-2`: Grade
     * @description This property is the {@link https://docs.microsoft.com/azure/cosmos-db/partitioning-overview partition key}.
     */
    nameIndex: -1 | -2
    /** Series title depend on official site. */
    series: Series
    /** Course difficulties */
    charts: CourseChartSchema[]
  }
>

/** Course difficulty */
export type CourseChartSchema = Strict<
  CourseChart,
  {
    /** {@link PlayStyle} */
    playStyle: PlayStyle
    /** {@link Difficulty} */
    difficulty: Difficulty
    /** Course order */
    order: CourseOrderSchema[]
  }
>

/** Course order */
export type CourseOrderSchema = Strict<
  CourseOrder,
  {
    /** {@link PlayStyle} */
    playStyle: PlayStyle
    /** {@link Difficulty} */
    difficulty: Difficulty
  }
>
