import type { Unwrap } from '../type-assert'
import type { StepChartSchema } from './songs'

export type ScoreSchema = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level'
> & {
  /** Auto Generated */
  id?: string
  /** User ID */
  userId: string
  userName: string
  /** `true` if this score is public, otherwize `false`. */
  isPublic: boolean
  /**
   * Song id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  songId: string
  songName: string
  /** Normal score (0-1000000) */
  score: number
  exScore?: number
  maxCombo?: number
  clearLamp: ClearLamp
  /** Clear rank (`"E"`～`"AAA"`) */
  rank: DanceLevel
  /** Groove Radar */
  radar?: Pick<
    StepChartSchema,
    'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
  >
}

/**
 * `0`: Failed,
 * `1`: Assisted Clear,
 * `2`: Clear,
 * `3`: LIFE4,
 * `4`: Good FC (Full Combo),
 * `5`: Great FC,
 * `6`: PFC,
 * `7`: MFC
 */
export type ClearLamp = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

const danceLevels = [
  'E',
  'D',
  'D+',
  'C-',
  'C',
  'C+',
  'B-',
  'B',
  'B+',
  'A-',
  'A',
  'A+',
  'AA-',
  'AA',
  'AA+',
  'AAA',
] as const
export type DanceLevel = Unwrap<typeof danceLevels>
export const danceLevelSet: ReadonlySet<DanceLevel> = new Set(danceLevels)
