import type { ScoreSchema } from './scores'
import type { GrooveRadar, StepChartSchema } from './songs'

export type GrooveRadarSchema = Pick<StepChartSchema, 'playStyle'> & {
  id?: string
  userId: string
  type: 'radar'
} & GrooveRadar

export type ClearStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'clearLamp'
> & {
  id?: string
  type: 'clear'
  count: number
}

export type ScoreStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'rank'
> & {
  id?: string
  type: 'score'
  count: number
}
