import { z } from 'zod'

import {
  type SongSchema,
  songSchema,
  type StepChartSchema,
  stepChartSchema,
} from './song'
import type { UserSchema } from './user'
import { userSchema } from './user'

/** zod schema object for {@link ScoreRecord}. */
export const scoreRecordSchema = z.object({
  /** Normal score (0-1000000) */
  score: z.number().int().min(0).max(1000000),
  /** EX SCORE */
  exScore: z.number().int().nonnegative().optional(),
  /** MAX COMBO */
  maxCombo: z.number().int().nonnegative().optional(),
  /**
   * Clear Lamp
   * @description
   * - `0`: Failed,
   * - `1`: Assisted Clear,
   * - `2`: Clear,
   * - `3`: LIFE 4 Clear,
   * - `4`: FULL COMBO (FC),
   * - `5`: GREAT FULL COMBO(GFC),
   * - `6`: PERFECT FULL COMBO(PFC),
   * - `7`: MARVELOUS FULL COMBO(MFC)
   */
  clearLamp: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
  ]),
  /** Dance level at best {@link ScoreRecord.score} */
  rank: z.union([
    z.literal('E'),
    z.literal('D'),
    z.literal('D+'),
    z.literal('C-'),
    z.literal('C'),
    z.literal('C+'),
    z.literal('B-'),
    z.literal('B'),
    z.literal('B+'),
    z.literal('A-'),
    z.literal('A'),
    z.literal('A+'),
    z.literal('AA-'),
    z.literal('AA'),
    z.literal('AA+'),
    z.literal('AAA'),
  ]),
  /**
   * Flare Rank
   * @description
   * `0`: None (Clear / LIFE 4 / RISKY), `1`: FLARE I, `1`: FLARE II, ..., `10`: FLARE EX)
   */
  flareRank: z
    .union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
      z.literal(7),
      z.literal(8),
      z.literal(9),
      z.literal(10),
    ])
    .optional(),
  flareSkill: z.number().int().readonly().optional(),
})
/** Primitive score */
export type ScoreRecord = z.infer<typeof scoreRecordSchema>
/** {@link ScoreRecord.clearLamp} */
export type ClearLamp = ScoreRecord['clearLamp']
/** `"E"` ~ `"AAA"` */
export type DanceLevel = ScoreRecord['rank']
/** {@link ScoreRecord.flareRank} */
export type FlareRank = Exclude<ScoreRecord['flareRank'], undefined>

const clearLamps = new Map<ClearLamp, string>([
  [0, 'Failed'],
  [1, 'Assisted Clear'],
  [2, 'Clear'],
  [3, 'Life 4'],
  [4, 'Full Combo'],
  [5, 'Great Full Combo'],
  [6, 'Perfect Full Combo'],
  [7, 'Marvelous Full Combo'],
])
/** Map for {@link ClearLamp} */
export const clearLampMap: ReadonlyMap<number, string> = clearLamps

const flareRanks: FlareRank[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
export const flareRankSet: ReadonlySet<number> = new Set(flareRanks)

const danceLevels: DanceLevel[] = [
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
]
/** Set for {@link DanceLevel} */
export const danceLevelSet: ReadonlySet<string> = new Set(danceLevels)

/** zod schema object for {@link ScoreSchema}. */
export const scoreSchema = scoreRecordSchema.extend({
  /** Auto Generated by Cosmos DB. */
  id: z.ostring(),
  /** {@link UserSchema.id} */
  userId: userSchema.shape.id,
  /** {@link UserSchema.name} */
  userName: userSchema.shape.name,
  /** `true` if this score is public, otherwize `false`. */
  isPublic: userSchema.shape.isPublic,
  /** {@link SongSchema.id} */
  songId: songSchema.shape.id,
  /** {@link SongSchema.name} */
  songName: songSchema.shape.name,
  playStyle: stepChartSchema.shape.playStyle,
  difficulty: stepChartSchema.shape.difficulty,
  level: stepChartSchema.shape.level,
  /**
   * {@link SongSchema.deleted}
   * If true, this score is not counted at total.
   */
  deleted: songSchema.shape.deleted,
})
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
 *   "rank": "AAA"
 * }
 * ```
 */
export type ScoreSchema = z.infer<typeof scoreSchema>

/**
 * Get {@link DanceLevel} from score.
 * @param score {@link ScoreSchema.score}
 */
export function getDanceLevel(score: number): Exclude<DanceLevel, 'E'> {
  const validatedScore = scoreSchema.shape.score.parse(score)
  const rankList = [
    { border: 990000, rank: 'AAA' },
    { border: 950000, rank: 'AA+' },
    { border: 900000, rank: 'AA' },
    { border: 890000, rank: 'AA-' },
    { border: 850000, rank: 'A+' },
    { border: 800000, rank: 'A' },
    { border: 790000, rank: 'A-' },
    { border: 750000, rank: 'B+' },
    { border: 700000, rank: 'B' },
    { border: 690000, rank: 'B-' },
    { border: 650000, rank: 'C+' },
    { border: 600000, rank: 'C' },
    { border: 590000, rank: 'C-' },
    { border: 550000, rank: 'D+' },
  ] as const
  for (const { border, rank } of rankList) {
    if (validatedScore >= border) return rank
  }
  return 'D'
}
/**
 * Calculate MAX score from chart info.
 * @param param0 {@link StepChartSchema}
 */
export function calcMaxScore({
  notes,
  freezeArrow,
  shockArrow,
}: Readonly<
  Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>
>): Required<Omit<ScoreRecord, 'flareSkill' | 'flareRank'>> {
  return {
    score: 1000000,
    exScore: (notes + freezeArrow + shockArrow) * 3,
    maxCombo: notes + shockArrow,
    clearLamp: 7,
    rank: 'AAA',
  }
}

/**
 * Returns merged max score.
 * @param left one side of score
 * @param right other side of score
 */
export function mergeScore(
  left: Readonly<ScoreRecord>,
  right: Readonly<ScoreRecord>
): ScoreRecord {
  const result: ScoreRecord = {
    score: Math.max(left.score, right.score),
    clearLamp:
      Math.min(left.clearLamp, right.clearLamp) === 1 &&
      Math.max(left.clearLamp, right.clearLamp) === 2
        ? 1 // Keep "Assisted Clear"
        : (Math.max(left.clearLamp, right.clearLamp) as ClearLamp),
    rank: left.score > right.score ? left.rank : right.rank,
  }
  if (left.exScore !== undefined || right.exScore !== undefined)
    result.exScore = Math.max(left.exScore ?? 0, right.exScore ?? 0)
  if (left.maxCombo !== undefined || right.maxCombo !== undefined)
    result.maxCombo = Math.max(left.maxCombo ?? 0, right.maxCombo ?? 0)
  return result
}

/**
 * Returns {@link ScoreRecord} is compliant chart or not.
 * @param param0 {@link StepChartSchema}
 * @param param1 {@link ScoreRecord}
 */
export function isValidScore(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  {
    clearLamp,
    exScore,
    maxCombo,
  }: Readonly<Omit<ScoreRecord, 'score' | 'rank'>>
): boolean {
  const { exScore: maxExScore, maxCombo: fullCombo } = calcMaxScore({
    notes,
    freezeArrow,
    shockArrow,
  })

  if (exScore) {
    if (
      !isPositiveInteger(exScore) ||
      exScore > maxExScore ||
      (clearLamp !== 7 && exScore === maxExScore) || // EX SCORE is MAX, but not MFC
      (clearLamp !== 6 && exScore === maxExScore - 1) || // EX SCORE is P1, but not PFC
      (clearLamp < 5 && exScore === maxExScore - 2) // EX SCORE is Gr1 or P2, but not Great FC or PFC
    )
      return false
  }

  // Do not check maxCombo because "MAX COMBO is fullCombo, but not FC" pattern is exists.
  // ex. missed last Freeze Arrow
  return !maxCombo || (isPositiveInteger(maxCombo) && maxCombo <= fullCombo)
}

/**
 * Create {@link ScoreSchema} from song, chart, user and score.
 * @param song Song & Chart info (from "Songs" container)
 * @param user User info (if area score, use mock user)
 * @param score Score data
 */
export function createScoreSchema(
  song: Readonly<Pick<SongSchema, 'id' | 'name' | 'deleted'> & StepChartSchema>,
  user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
  score: Readonly<ScoreRecord>
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

  return scoreSchema
}

/**
 * Fill missing {@link ScoreRecord} property from {@link StepChartSchema}.
 * @param param0 {@link StepChartSchema}
 * @param partialScore {@link ScoreRecord}
 */
export function setValidScoreFromChart(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  partialScore: Readonly<Partial<ScoreRecord>>
): ScoreRecord {
  const objects = notes + freezeArrow + shockArrow
  /** Max EX SCORE */
  const maxExScore = objects * 3
  /** Full Combo */
  const maxCombo = notes + shockArrow
  /** Marvelous or O.K. score */
  const baseScore = 1000000 / objects
  /** Great score */
  const great = baseScore * 0.6 - 10
  /** Good score */
  const good = baseScore * 0.2 - 10

  const isFailed = partialScore.rank === 'E' || partialScore.clearLamp === 0

  if (isMFC()) {
    return {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore: maxExScore,
      maxCombo,
    }
  }

  // Patterns that can be calculated from EX SCORE
  const scoreFromEx = tryCalcFromExScore()
  if (scoreFromEx !== null) {
    return scoreFromEx
  }

  if (partialScore.score === undefined)
    throw new Error('Cannot guess Score object. set score property')

  const result: ScoreRecord = {
    ...partialScore,
    score: partialScore.score,
    rank: getDanceLevel(partialScore.score),
    clearLamp: partialScore.clearLamp ?? 2, // set "Clear" default
  }

  if (isPFC()) {
    const dropCount = (1000000 - partialScore.score) / 10
    return {
      ...result,
      clearLamp: 6,
      exScore: maxExScore - dropCount,
      maxCombo,
    }
  }

  if (isGreatFC()) {
    const calcFromGreatFC = tryCalcFromGreatFC()
    return (
      calcFromGreatFC ?? {
        ...result,
        clearLamp: 5,
        maxCombo,
      }
    )
  }

  if (isGood1()) {
    /** Perfect:0, Great:0, Good:1 Score */
    const target = floorScore(1000000 - baseScore + good)
    const perfectCount = (target - partialScore.score) / 10
    return {
      ...result,
      clearLamp: 4,
      exScore: maxExScore - 3 - perfectCount,
      maxCombo,
    }
  }

  if (isGoodFC()) {
    return {
      ...result,
      clearLamp: 4,
      maxCombo,
    }
  }

  if (isFailed) {
    result.clearLamp = 0
    result.rank = 'E'
  }

  // Currently, 0 point can only be obtained by the following methods:
  // 1. Failed
  // 2. CHAOS [SP-BEGINNER] with CUT1 (= Assisted Clear)
  // 3. ようこそジャパリパークへ [DP-CHALLENGE] with JUMP OFF (= Assisted Clear)
  if (partialScore.score === 0) {
    return {
      ...result,
      score: 0,
      clearLamp: isFailed ? 0 : 1,
      exScore: 0,
      maxCombo: 0,
    }
  }

  if (isMiss1()) {
    /** Perfect:0, Great:0, Good:0, Miss:1 score */
    const target = floorScore(1000000 - baseScore)
    const perfectCount = (target - partialScore.score) / 10
    result.exScore = maxExScore - 3 - perfectCount
  }

  return result

  function isMFC() {
    return (
      partialScore.clearLamp === 7 ||
      partialScore.score === 1000000 ||
      partialScore.exScore === maxExScore
    )
  }

  function isPFC() {
    return (
      partialScore.clearLamp === 6 || // ClearLamp is PFC
      partialScore.score! > floorScore(1000000 - baseScore + great) // Score is greater than Gr:1 score
    )
  }

  function isGreatFC() {
    return (
      partialScore.clearLamp === 5 || // ClearLamp is GreatFC
      partialScore.score! > floorScore(1000000 - baseScore + good) // Score is greater than Good:1 score
    )
  }

  function isGoodFC() {
    return (
      partialScore.clearLamp === 4 || // ClearLamp is GoodFC
      partialScore.score! > floorScore(1000000 - baseScore) // Score is greater than Miss:1 score
    )
  }

  function isGood1() {
    return (
      partialScore.clearLamp === 4 &&
      partialScore.score! > floorScore(1000000 - baseScore * 2 - good + great) // Score is greater than Great:1, Good:1 score
    )
  }

  function isMiss1() {
    return (
      (partialScore.clearLamp ?? 2) < 4 && // Not selected Full combo
      (partialScore.score! > floorScore(1000000 - baseScore * 2 + great) || // Score is greater than Great:1, Miss:1
        partialScore.maxCombo === maxCombo) // [Note]: This is NOT Full Combo. (ex. missed last Freeze Arrow)
    )
  }

  function tryCalcFromGreatFC(): ScoreRecord | null {
    const dropScore = great - baseScore

    // Try to calc great count from score
    let greatCount = 0
    while (
      floorScore(1000000 + dropScore * (greatCount + 1)) >= partialScore.score!
    ) {
      greatCount++
    }

    // Can calc
    if (greatCount === 1 || (notes - greatCount) * 10 < -dropScore) {
      /** Perfect:0, Great: greatCount Score */
      const target = floorScore(1000000 + dropScore * greatCount)
      const perfectCount = (target - partialScore.score!) / 10
      return {
        score: partialScore.score!,
        rank: getDanceLevel(partialScore.score!),
        clearLamp: 5,
        exScore: maxExScore - perfectCount - greatCount * 2,
        maxCombo,
      }
    }

    return null
  }

  function tryCalcFromExScore(): ScoreRecord | null {
    // 1 Perfect
    if (partialScore.exScore === maxExScore - 1) {
      return {
        score: 999990,
        rank: 'AAA',
        clearLamp: 6,
        exScore: maxExScore - 1,
        maxCombo,
      }
    }

    // X Perfects
    if (partialScore.clearLamp === 6 && partialScore.exScore) {
      const dropCount = maxExScore - partialScore.exScore
      return {
        score: 1000000 - dropCount * 10,
        rank: 'AAA',
        clearLamp: 6,
        exScore: Math.max(maxExScore - dropCount, partialScore.exScore ?? 0),
        maxCombo,
      }
    }

    // 1 Great 0 Perfect
    if (
      partialScore.clearLamp === 5 &&
      partialScore.exScore === maxExScore - 2
    ) {
      const score = floorScore(1000000 - baseScore + great)
      return {
        score,
        rank: getDanceLevel(score),
        clearLamp: 5,
        exScore: maxExScore - 2,
        maxCombo,
      }
    }

    // 1 Good 0 Great 0 Perfect
    if (
      partialScore.clearLamp === 4 &&
      partialScore.exScore === maxExScore - 3
    ) {
      const score = floorScore(1000000 - baseScore + good)
      return {
        score,
        rank: getDanceLevel(score),
        clearLamp: 4,
        exScore: maxExScore - 3,
        maxCombo,
      }
    }

    return null
  }

  /** Round down ones digit (ex. 998756 => 998750) */
  function floorScore(rawScore: number) {
    return Math.floor(rawScore / 10) * 10
  }
}

/**
 * Calculate Flare skill score.
 * @param level Level of step chart
 * @param flareRank Flare Rank
 */
export function calcFlareSkill(
  level: number,
  flareRank: FlareRank = 0
): number {
  level = stepChartSchema.shape.level.parse(level)
  const baseScores = [
    145, 155, 170, 185, 205, 230, 255, 290, 335, 400, 465, 510, 545, 575, 600,
    620, 635, 650, 665, 0,
  ]
  return Math.floor(baseScores[level - 1] * (flareRank * 0.06 + 1))
}

/**
 * Detect judge counts from normal score.
 * @remarks This function costs O(n^4) on worst case. consider set clearLamp arg if you know.
 * @param chart Step chart
 * @param score Normal score
 * @param clearLamp {@link ClearLamp}
 * @returns jugement count patterns
 */
export function detectJudgeCounts(
  chart: Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>,
  score: number,
  clearLamp: ClearLamp = 0
): {
  marvelousOrOk: number
  perfect: number
  great: number
  good: number
  miss: number
}[] {
  score = scoreSchema.shape.score.parse(score)
  const total = chart.notes + chart.freezeArrow + chart.shockArrow
  const result: {
    marvelousOrOk: number
    perfect: number
    great: number
    good: number
    miss: number
  }[] = []

  for (let miss = 0; miss <= total; miss++) {
    if (miss > 0 && clearLamp >= 4) break
    if (miss > 3 && clearLamp >= 3) break
    if (score > calcNormalScore(total, total - miss, 0, 0, 0)) break

    for (let good = 0; good <= total - miss; good++) {
      if (good > 0 && clearLamp >= 5) break
      if (score > calcNormalScore(total, total - miss - good, 0, 0, good)) break

      for (let great = 0; great <= total - miss - good; great++) {
        if (great > 0 && clearLamp >= 6) break
        if (
          score >
          calcNormalScore(total, total - miss - good - great, 0, great, good)
        )
          break

        for (
          let perfect = 0;
          perfect <= total - miss - good - great;
          perfect++
        ) {
          if (perfect > 0 && clearLamp >= 7) break

          const marvelousAndOk = total - perfect - great - good - miss
          const calcedScore = calcNormalScore(
            total,
            marvelousAndOk,
            perfect,
            great,
            good
          )
          if (score === calcedScore)
            result.push({
              marvelousOrOk: marvelousAndOk,
              perfect,
              great,
              good,
              miss,
            })
          else if (score > calcedScore) break
        }
      }
    }
  }

  return result.sort((a, b) =>
    a.marvelousOrOk !== b.marvelousOrOk
      ? b.marvelousOrOk - a.marvelousOrOk
      : b.perfect - a.perfect
  )
}

/**
 * Calculate normal score from judge counts.
 * @param totalNotes Notes + Freeze Arrow count + Shock Arrow count
 * @param marvelousAndOk Marvelous & OK count
 * @param perfect Perfect count
 * @param great Great count
 * @param good Good count
 * @returns Normal Score
 */
export function calcNormalScore(
  totalNotes: number,
  marvelousAndOk: number,
  perfect: number,
  great: number,
  good: number
): number {
  return (
    Math.floor(
      (100000 * (marvelousAndOk + perfect) + 60000 * great + 20000 * good) /
        totalNotes -
        perfect -
        great -
        good
    ) * 10
  )
}

const isPositiveInteger = (n: number) => Number.isInteger(n) && n >= 0
