import type { ScoreSchema } from './scores'
import type { StepChartSchema } from './songs'

export type UserDetailsSchema =
  | GrooveRadarSchema
  | ClearStatusSchema
  | ScoreStatusSchema

export type GrooveRadarSchema = Pick<
  StepChartSchema,
  'playStyle' | 'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
> & {
  userId: string
  type: 'radar'
}

export type ClearStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'clearLamp'
> & {
  type: 'clear'
  count: number
}

export type ScoreStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'rank'
> & {
  type: 'score'
  count: number
}
