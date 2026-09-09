import type { infer as zodInfer } from 'zod/mini'

import type {
  danceLevels,
  scoreRecordInputSchema,
  scoreRecordSchema,
} from '#shared/schemas/score'

export type DanceLevel = (typeof danceLevels)[number]

/** Score record */
export type ScoreRecord = zodInfer<typeof scoreRecordSchema>

/** Input type for batch insert or update ScoreRecord */
export type ScoreRecordInput = zodInfer<typeof scoreRecordInputSchema>

/** Score record with related song, chart, and user info */
export type ScoreSearchResult = ScoreRecord & {
  song: Pick<SongInfo, 'id' | 'name' | 'artist'>
  chart: Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>
  user: Pick<User, 'id' | 'name' | 'area'>
  updatedAt: Date
}
