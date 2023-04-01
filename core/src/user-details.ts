import type { UserClearLamp, UserGrooveRadar, UserRank } from './graphql'
import type { ClearLamp, DanceLevel } from './score'
import type { PlayStyle } from './song'
import type { Strict } from './type-assert'

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
export type UserGrooveRadarSchema = Strict<
  UserGrooveRadar,
  {
    /** User details type */
    type: 'radar'
    /** {@link PlayStyle} */
    playStyle: PlayStyle
  }
>

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
export type UserClearLampSchema = Strict<
  UserClearLamp,
  {
    /** User details type */
    type: 'clear'
    /** {@link PlayStyle} */
    playStyle: PlayStyle
    /** {@link ClearLamp} */
    clearLamp: ClearLamp
  }
>

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
export type UserRankSchema = Strict<
  UserRank,
  {
    /** User details type */
    type: 'score'
    /** {@link PlayStyle} */
    playStyle: PlayStyle
    rank: DanceLevel
  }
>
