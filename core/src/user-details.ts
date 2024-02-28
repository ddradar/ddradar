import { z } from 'zod'

import type { UserClearLamp, UserGrooveRadar, UserRank } from './graphql'
import { scoreSchema } from './score'
import { stepChartSchema } from './song'

/** zod schema object for {@link UserGrooveRadarSchema}. */
const userGrooveRadarSchema = scoreSchema
  .pick({ userId: true, playStyle: true })
  .merge(
    stepChartSchema.pick({
      playStyle: true,
      stream: true,
      voltage: true,
      air: true,
      freeze: true,
      chaos: true,
    })
  )
  .extend({ type: z.literal('radar') }) satisfies z.ZodType<UserGrooveRadar>
/**
 * Summary of GrooveRadar (included in "UserDetails" container)
 * @example
 * ```json
 * {
 *   "userId": "user_1",
 *   "type": "radar",
 *   "playStyle": 1,
 *   "stream": 100,
 *   "voltage": 100,
 *   "air": 100,
 *   "freeze": 100,
 *   "chaos": 100
 * }
 * ```
 */
export type UserGrooveRadarSchema = UserGrooveRadar &
  z.infer<typeof userGrooveRadarSchema>

/** zod schema object for {@link UserClearLampSchema}. */
const userClearLampSchema = scoreSchema
  .pick({ userId: true, playStyle: true, level: true, clearLamp: true })
  .extend({
    type: z.literal('clear'),
    count: z.number().int().nonnegative(),
  }) satisfies z.ZodType<UserClearLamp>
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
export type UserClearLampSchema = UserClearLamp &
  z.infer<typeof userClearLampSchema>

/** zod schema object for {@link UserRankSchema}. */
export const userRankSchema = scoreSchema
  .pick({ userId: true, playStyle: true, level: true, rank: true })
  .extend({
    type: z.literal('score'),
    count: z.number().int().nonnegative(),
  }) satisfies z.ZodType<UserRank>
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
export type UserRankSchema = UserRank & z.infer<typeof userRankSchema>
