import { z } from 'zod'

import { scoreSchema } from './score'

/** zod schema object for {@link UserClearLampSchema}. */
export const userClearLampSchema = scoreSchema
  .pick({ userId: true, playStyle: true, level: true, clearLamp: true })
  .extend({
    type: z.literal('clear'),
    count: z.number().int().nonnegative(),
  })
/**
 * Summary of {@link ClearLamp} (included in "UserDetails" container)
 * @example
 * ```json
 * {
 *   "userId": "user_1",
 *   "type": "clear",
 *   "playStyle": 1,
 *   "level": 5,
 *   "clearLamp": 6,
 *   "count": 53
 * }
 * ```
 */
export type UserClearLampSchema = z.infer<typeof userClearLampSchema>

/** zod schema object for {@link UserRankSchema}. */
export const userRankSchema = scoreSchema
  .pick({ userId: true, playStyle: true, level: true, rank: true })
  .extend({
    type: z.literal('score'),
    count: z.number().int().nonnegative(),
  })
/**
 * Summary of {@link DanceLevel} (included in "UserDetails" container)
 * @example
 * ```json
 * {
 *   "userId": "user_1",
 *   "type": "clear",
 *   "playStyle": 1,
 *   "level": 5,
 *   "rank": "AAA",
 *   "count": 53
 * }
 * ```
 */
export type UserRankSchema = z.infer<typeof userRankSchema>
