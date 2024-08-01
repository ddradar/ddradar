import { z } from 'zod'

import { scoreRecordSchema } from './score'
import { stepChartSchema } from './song'
import { userSchema } from './user'

export const userFlareRankSchema = z.object({
  userId: z.string(),
  type: z.literal('flare'),
  playStyle: z.number().int(),
  level: z.number().int(),
  rank: z.string(),
  count: z.number().int().nonnegative(),
})

/** zod schema object for {@link UserClearLampSchema}. */
export const userClearLampSchema = z.object({
  userId: userSchema.shape.id,
  type: z.literal('clear'),
  playStyle: stepChartSchema.shape.playStyle,
  level: stepChartSchema.shape.level,
  clearLamp: scoreRecordSchema.shape.clearLamp,
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
export const userRankSchema = z.object({
  userId: userSchema.shape.id,
  type: z.literal('score'),
  playStyle: stepChartSchema.shape.playStyle,
  level: stepChartSchema.shape.level,
  rank: scoreRecordSchema.shape.rank,
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
