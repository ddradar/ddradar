import type { ClearLamp, DanceLevel } from '../db/scores'
import type {
  ClearStatusSchema,
  GrooveRadarSchema,
  ScoreStatusSchema,
} from '../db/userDetails'

/**
 * Object type returned by `/api/v1/users/{:id}/clear`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id__clear/
 */
export type ClearStatus = Pick<
  ClearStatusSchema,
  'playStyle' | 'level' | 'count'
> & {
  /**
   * `-1`: No Play,
   * `0`: Failed,
   * `1`: Assisted Clear,
   * `2`: Clear,
   * `3`: LIFE4,
   * `4`: Good FC (Full Combo),
   * `5`: Great FC,
   * `6`: PFC,
   * `7`: MFC
   */
  clearLamp: ClearLamp | -1
}

/**
 * Object type returned by `/api/v1/users/{:id}/score`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id__score/
 */
export type ScoreStatus = Pick<
  ScoreStatusSchema,
  'playStyle' | 'level' | 'count'
> & {
  /** Dance level (`"E"` ~ `"AAA"`), `"-"`: No Play */
  rank: DanceLevel | '-'
}

/**
 * Object type returned by `/api/v1/users/{:id}/radar/{:playStyle}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id__radar__style/
 */
export type GrooveRadarInfo = Omit<GrooveRadarSchema, 'userId' | 'type'>
