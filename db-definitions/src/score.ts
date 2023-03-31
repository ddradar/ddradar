import type { CourseChartSchema } from './course'
import type { GrooveRadar, Score } from './graphql'
import type { Difficulty, PlayStyle, SongSchema, StepChartSchema } from './song'
import type { Strict } from './type-assert'
import { hasIntegerProperty } from './type-assert'
import type { UserSchema } from './user'
import { isAreaUser } from './user'

/**
 * DB schema of "Scores" container
 * @example
 * ```json
 * {
 *   "userId": "some_user1",
 *   "userName": "User1",
 *   "isPublic": true,
 *   "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *   "songName": "愛言葉",
 *   "playStyle": 1,
 *   "difficulty": 0,
 *   "level": 3,
 *   "score": 1000000,
 *   "exScore": 402,
 *   "maxCombo": 122,
 *   "clearLamp": 7,
 *   "rank": "AAA",
 *   "radar": {
 *     "stream": 21,
 *     "voltage": 22,
 *     "air": 7,
 *     "freeze": 26,
 *     "chaos": 0
 *   }
 * }
 * ```
 */
export type ScoreSchema = Strict<
  Score,
  {
    /** {@link PlayStyle} */
    playStyle: PlayStyle
    /** {@link Difficulty} */
    difficulty: Difficulty
    /** Highest {@link ClearLamp} */
    clearLamp: ClearLamp
    /** {@link DanceLevel} at the highest score */
    rank: DanceLevel
  }
>
export type ScoreBody = Pick<
  ScoreSchema,
  'score' | 'exScore' | 'maxCombo' | 'clearLamp' | 'rank'
>

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
export type ClearLamp = Parameters<typeof clearLamps.set>[0]
/** Map for {@link ClearLamp} */
export const clearLampMap: ReadonlyMap<number, string> = clearLamps

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
/** Dance level (`"E"` ~ `"AAA"`) */
export type DanceLevel = (typeof danceLevels)[number]
/** Set for {@link DanceLevel} */
export const danceLevelSet: ReadonlySet<string> = new Set(danceLevels)

/**
 * Create {@link ScoreSchema} from song, chart, user and score.
 * @param song Song & Chart info (from "Songs" container)
 * @param user User info (if area score, use mock user)
 * @param score Score data
 */
export function createScoreSchema(
  song: Readonly<
    Pick<SongSchema, 'id' | 'name' | 'deleted'> &
      (StepChartSchema | CourseChartSchema)
  >,
  user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
  score: Readonly<ScoreBody>
): ScoreSchema {
  const scoreSchema: ScoreSchema = {
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId: song.id,
    songName: song.name,
    playStyle: song.playStyle,
    difficulty: song.difficulty,
    level: song.level,
    score: score.score,
    clearLamp: score.clearLamp,
    rank: score.rank,
  }
  if (score.exScore) scoreSchema.exScore = score.exScore
  if (score.maxCombo) scoreSchema.maxCombo = score.maxCombo
  if (song.deleted) scoreSchema.deleted = true
  if (score.clearLamp === 7) {
    scoreSchema.exScore = (song.notes + song.freezeArrow + song.shockArrow) * 3
  }
  if (score.clearLamp >= 4) {
    scoreSchema.maxCombo = song.notes + song.shockArrow
  }

  if (!isAreaUser(user) && isSongInfo(song)) {
    scoreSchema.radar = calcMyGrooveRadar(song, score)
  }

  return scoreSchema

  function isSongInfo(chart: unknown): chart is StepChartSchema {
    return hasIntegerProperty(chart, 'stream')
  }
}

/**
 * Calcurate My Groove Radar from score.
 * @param chart Target chart
 * @param score Target score
 * @returns Groove Radar value
 */
export function calcMyGrooveRadar(
  chart: Omit<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>,
  score: ScoreBody
): GrooveRadar {
  const note = chart.notes + chart.shockArrow
  const isFullCombo = score.clearLamp >= 4
  const maxCombo = isFullCombo ? note : score.maxCombo ?? 0

  // Treat as miss:3 if Life 4 Clear
  const arrowCount =
    score.clearLamp === 3 ? Math.max(maxCombo, note - 3) : maxCombo
  const freezeCount = isFullCombo
    ? chart.freezeArrow
    : score.clearLamp === 3
    ? chart.freezeArrow - 3
    : 0

  return {
    stream: Math.trunc((chart.stream * score.score) / 1000000),
    voltage: Math.trunc((chart.voltage * maxCombo) / note),
    air: Math.trunc((chart.air * arrowCount) / note),
    freeze:
      chart.freezeArrow === 0
        ? 0
        : Math.trunc((chart.freeze * freezeCount) / chart.freezeArrow),
    chaos: Math.trunc((chart.chaos * arrowCount) / note),
  }
}
