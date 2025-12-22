import type {
  danceLevels,
  scoreRecordInputSchema,
  scoreRecordSchema,
} from '~~/shared/schemas/score'

export type DanceLevel = (typeof danceLevels)[number]

/** Score record */
export type ScoreRecord = ZodInfer<typeof scoreRecordSchema>

/** Input type for batch insert or update ScoreRecord */
export type ScoreRecordInput = ZodInfer<typeof scoreRecordInputSchema>

/** Score record with related song, chart, and user info */
export type ScoreSearchResult = ScoreRecordInput & {
  song: Pick<SongInfo, 'name' | 'artist'>
  chart: Pick<StepChart, 'level'>
  user: Pick<User, 'name' | 'area'>
  updatedAt: Date
}
