import { fetchOne, ItemDefinition } from '.'
import type { Difficulty, StepChartSchema } from './songs'

export type ScoreSchema = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level'
> & {
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
  rank: string
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

export const DanceLevelList = [
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

export function fetchScore(
  userId: string,
  songId: string,
  playStyle: 1 | 2,
  difficulty: Difficulty
): Promise<(ScoreSchema & ItemDefinition) | null> {
  return fetchOne<ScoreSchema>(
    'Scores',
    [
      'id',
      'userId',
      'userName',
      'isPublic',
      'songId',
      'songName',
      'playStyle',
      'difficulty',
      'level',
      'clearLamp',
      'score',
      'rank',
      'exScore',
      'maxCombo',
      'radar',
    ],
    [
      { condition: 'c.userId = @', value: userId },
      { condition: 'c.songId = @', value: songId },
      { condition: 'c.playStyle = @', value: playStyle },
      { condition: 'c.difficulty = @', value: difficulty },
      { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
    ]
  )
}
