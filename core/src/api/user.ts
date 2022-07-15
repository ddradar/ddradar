import type { DanceLevel } from '../db/scores'
import type { GrooveRadarSchema, ScoreStatusSchema } from '../db/userDetails'

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
