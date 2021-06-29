import type { ScoreBody } from '../api/score'
import { calcMyGrooveRadar } from '../score'
import { hasIntegerProperty, Unwrap } from '../typeUtils'
import type {
  CourseChartSchema,
  CourseSchema,
  SongSchema,
  StepChartSchema,
} from './songs'
import type { UserSchema } from './users'
import { isAreaUser } from './users'

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
  rank: DanceLevel
  /** Groove Radar */
  radar?: Pick<
    StepChartSchema,
    'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
  >
  /**
   * Song is deleted or not.
   * If true, this score is not counted.
   */
  deleted?: boolean
}

const clearLamps = new Map([
  [0, 'Failed'],
  [1, 'Assisted Clear'],
  [2, 'Clear'],
  [3, 'Life 4'],
  [4, 'Full Combo'],
  [5, 'Great Full Combo'],
  [6, 'Perfect Full Combo'],
  [7, 'Marvelous Full Combo'],
] as const)
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
export type ClearLamp = Unwrap<typeof clearLamps>[0]
export const clearLampMap: ReadonlyMap<
  ClearLamp,
  Unwrap<typeof clearLamps>[1]
> = clearLamps

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

/**
 * Create ScoreSchema from song, chart, user and score.
 */
export function createScoreSchema(
  song: Pick<SongSchema | CourseSchema, 'id' | 'name' | 'deleted'>,
  chart: Readonly<StepChartSchema | CourseChartSchema>,
  user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
  score: Readonly<ScoreBody>
): ScoreSchema {
  const scoreSchema: ScoreSchema = {
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId: song.id,
    songName: song.name,
    playStyle: chart.playStyle,
    difficulty: chart.difficulty,
    level: chart.level,
    score: score.score,
    clearLamp: score.clearLamp,
    rank: score.rank,
  }
  if (score.exScore) scoreSchema.exScore = score.exScore
  if (score.maxCombo) scoreSchema.maxCombo = score.maxCombo
  if (song.deleted) scoreSchema.deleted = true

  if (!isAreaUser(user) && isSongChart(chart)) {
    scoreSchema.radar = calcMyGrooveRadar(chart, score)
  }

  return scoreSchema

  function isSongChart(chart: unknown): chart is StepChartSchema {
    return hasIntegerProperty(chart, 'stream')
  }
}
