import { fetchList, fetchOne } from '.'
import type { Difficulty, StepChartSchema } from './songs'
import { UserSchema } from './users'

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
): Promise<Omit<ScoreSchema, 'isPublic'> | null> {
  return fetchOne<Omit<ScoreSchema, 'isPublic'>>(
    'Scores',
    [
      'userId',
      'userName',
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

export function fetchChartScores(
  songId: string,
  playStyle: 1 | 2,
  difficulty: Difficulty,
  scope: 'medium' | 'full' = 'medium',
  user?: Pick<UserSchema, 'id' | 'area'> | null
): Promise<Omit<ScoreSchema, 'isPublic'>[]> {
  return fetchList<Omit<ScoreSchema, 'isPublic'>>(
    'Scores',
    [
      'userId',
      'userName',
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
    ],
    [
      { condition: 'c.songId = @', value: songId },
      { condition: 'c.playStyle = @', value: playStyle },
      { condition: 'c.difficulty = @', value: difficulty },
      {
        condition:
          scope === 'full'
            ? '(c.isPublic = true OR ARRAY_CONTAINS(@, c.userId))'
            : 'ARRAY_CONTAINS(@, c.userId)',
        value: ['0', ...(user ? [`${user.id}`, `${user.area}`] : [])],
      },
      { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
    ],
    {
      score: 'DESC',
      clearLamp: 'DESC',
      _ts: 'ASC',
    }
  )
}
