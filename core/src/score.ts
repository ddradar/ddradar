import { z } from 'zod'

import { type Song, type StepChart, stepChartSchema } from './song'
import type { User } from './user'

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
  flareSkill: z.number().int().optional(),
})
/** Primitive score */
export type ScoreRecord = z.infer<typeof scoreRecordSchema>

/** {@link ScoreRecord.clearLamp} */
export type ClearLamp = ScoreRecord['clearLamp']
/** Enum object for {@link ClearLamp} */
export const Lamp = {
  /** Failed */
  Failed: 0,
  /** Clear with Assisted options (CUT, JUMP OFF or FREEZE OFF), or failed on Local Versus (BPL) mode */
  Assisted: 1,
  /** Clear with Normal or FLARE gauge */
  Clear: 2,
  /** Clear with Life 4 gauge */
  Life4: 3,
  /** (Good) Full Combo */
  FC: 4,
  /** Great Full Combo (contains only Great or above) */
  GFC: 5,
  /** Perfect Full Combo (contains only Perfect or above) */
  PFC: 6,
  /** Marvelous Full Combo (contains only Marvelous) */
  MFC: 7,
} as const
/** Map for {@link ClearLamp} */
export const clearLampMap: ReadonlyMap<number, string> = new Map([
  [0, 'Failed'],
  [1, 'Assisted Clear'],
  [2, 'Clear'],
  [3, 'Life 4'],
  [4, 'Full Combo'],
  [5, 'Great Full Combo'],
  [6, 'Perfect Full Combo'],
  [7, 'Marvelous Full Combo'],
] satisfies [ClearLamp, string][])

/** `"E"` ~ `"AAA"` */
export type DanceLevel = ScoreRecord['rank']
/** Set for {@link DanceLevel} */
export const danceLevelSet: ReadonlySet<string> = new Set([
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
] satisfies DanceLevel[])

/** {@link ScoreRecord.flareRank} */
export type FlareRank = Exclude<ScoreRecord['flareRank'], undefined>
/** Enum object for {@link FlareRank} */
export const Flare = {
  /** No FLARE */
  None: 0,
  /** FLARE I */
  I: 1,
  /** FLARE II */
  II: 2,
  /** FLARE III */
  III: 3,
  /** FLARE IV */
  IV: 4,
  /** FLARE V */
  V: 5,
  /** FLARE VI */
  VI: 6,
  /** FLARE VII */
  VII: 7,
  /** FLARE VIII */
  VIII: 8,
  /** FLARE IX */
  IX: 9,
  /** FLARE EX */
  EX: 10,
} as const
/** Set for {@link FlareRank} */
export const flareRankSet: ReadonlySet<number> = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
] satisfies FlareRank[])

/** Score record linked to user, song and chart */
export type UserScoreRecord = ScoreRecord & {
  /** User ID */
  userId: User['id']
  /** User name */
  userName: User['name']
  /** Song ID */
  songId: Song['id']
  /** Song name */
  songName: Song['name']
} & Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>

/**
 * Get {@link DanceLevel} from score.
 * @param score {@link ScoreSchema.score}
 */
export function getDanceLevel(score: number): Exclude<DanceLevel, 'E'> {
  const validatedScore = scoreRecordSchema.shape.score.parse(score)
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
 * @param param0 {@link StepChart}
 */
export function calcMaxScore({
  notes,
  freezeArrow,
  shockArrow,
}: Readonly<Pick<StepChart, 'notes' | 'freezeArrow' | 'shockArrow'>>): Required<
  Omit<ScoreRecord, 'flareSkill' | 'flareRank'>
> {
  return {
    score: 1000000,
    exScore: (notes + freezeArrow + shockArrow) * 3,
    maxCombo: notes + shockArrow,
    clearLamp: Lamp.MFC,
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
 * @param param0 {@link StepChart}
 * @param param1 {@link ScoreRecord}
 */
export function isValidScore(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChart, 'notes' | 'freezeArrow' | 'shockArrow'>>,
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
      !scoreRecordSchema.shape.exScore.safeParse(exScore).success ||
      exScore > maxExScore ||
      (clearLamp !== 7 && exScore === maxExScore) || // EX SCORE is MAX, but not MFC
      (clearLamp !== 6 && exScore === maxExScore - 1) || // EX SCORE is P1, but not PFC
      (clearLamp < 5 && exScore === maxExScore - 2) // EX SCORE is Gr1 or P2, but not Great FC or PFC
    )
      return false
  }

  // Do not treat (maxCombo = fullCombo count) as FULL COMBO because "MAX COMBO is fullCombo, but not FC" pattern is exists.
  // ex. missed last Freeze Arrow
  return (maxCombo ?? 0) <= fullCombo
}

/**
 * Fill missing {@link ScoreRecord} property from {@link StepChart}.
 * @param param0 {@link StepChart}
 * @param partialScore {@link ScoreRecord}
 */
export function setValidScoreFromChart(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChart, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  partialScore: Readonly<Partial<ScoreRecord>>
): ScoreRecord {
  const objects = notes + freezeArrow + shockArrow
  /** Max EX SCORE */
  const maxExScore = objects * 3
  /** Full Combo */
  const maxCombo = notes + shockArrow

  const isFailed = partialScore.rank === 'E' || partialScore.clearLamp === 0

  if (isMFC()) {
    return {
      ...partialScore,
      score: 1000000,
      rank: 'AAA',
      clearLamp: Lamp.MFC,
      exScore: maxExScore,
      maxCombo,
    }
  }

  // Patterns that can be calculated from EX SCORE
  const scoreFromEx = tryCalcFromExScore()
  if (scoreFromEx !== null) {
    return { ...partialScore, ...scoreFromEx }
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
      clearLamp: Lamp.PFC,
      exScore: maxExScore - dropCount,
      maxCombo,
    }
  }

  if (isGreatFC()) {
    return tryCalcFromGreatFC() ?? { ...result, clearLamp: Lamp.GFC, maxCombo }
  }

  if (isGreat0Good1()) {
    /** Perfect:0, Great:0, Good:1 Score */
    const target = calcNormalScore(objects, objects - 1, 0, 0, 1)
    const perfectCount = (target - partialScore.score) / 10
    return {
      ...result,
      clearLamp: Lamp.FC,
      exScore: maxExScore - 3 - perfectCount,
      maxCombo,
    }
  }

  if (isGoodFC()) {
    return {
      ...result,
      clearLamp: Lamp.FC,
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
  // 3. Flare gauge clear (= Clear)
  //     - ex. FLARE I allows up to 66 miss, so 66 or less notes chart can be cleared with 0 point
  if (partialScore.score === 0) {
    return {
      ...result,
      score: 0,
      clearLamp: isFailed ? 0 : partialScore.flareRank ? 2 : 1,
      exScore: 0,
      maxCombo: 0,
    }
  }

  if (isGreat0Good0Miss1()) {
    /** Perfect:0, Great:0, Good:0, Miss:1 score */
    const target = calcNormalScore(objects, objects - 1, 0, 0, 0)
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
      partialScore.score! > calcNormalScore(objects, objects - 1, 0, 1, 0) // Score is greater than Great:1 score
    )
  }

  function isGreatFC() {
    return (
      partialScore.clearLamp === 5 || // ClearLamp is GreatFC
      partialScore.score! > calcNormalScore(objects, objects - 1, 0, 0, 1) // Score is greater than Good:1 score
    )
  }

  function isGoodFC() {
    return (
      partialScore.clearLamp === 4 || // ClearLamp is GoodFC
      partialScore.score! > calcNormalScore(objects, objects - 1, 0, 0, 0) // Score is greater than Miss:1 score
    )
  }

  function isGreat0Good1() {
    return (
      partialScore.clearLamp === 4 &&
      partialScore.score! > calcNormalScore(objects, objects - 2, 0, 1, 1) // Score is greater than Great:1, Good:1 score
    )
  }

  function isGreat0Good0Miss1() {
    return (
      (partialScore.clearLamp ?? 2) < 4 && // Not selected Full combo
      (partialScore.score! > calcNormalScore(objects, objects - 2, 0, 1, 0) || // Score is greater than Great:1, Miss:1
        partialScore.maxCombo === maxCombo) // [Note]: This is NOT Full Combo. (ex. missed last Freeze Arrow)
    )
  }

  function tryCalcFromExScore(): ScoreRecord | null {
    if (partialScore.exScore === undefined) return null

    // 1 Perfect
    if (partialScore.exScore === maxExScore - 1) {
      return {
        score: 999990,
        rank: 'AAA',
        clearLamp: Lamp.PFC,
        exScore: maxExScore - 1,
        maxCombo,
      }
    }

    // X Perfects
    if (partialScore.clearLamp === 6) {
      const dropCount = maxExScore - partialScore.exScore
      return {
        score: 1000000 - dropCount * 10,
        rank: 'AAA',
        clearLamp: Lamp.PFC,
        exScore: Math.max(maxExScore - dropCount, partialScore.exScore),
        maxCombo,
      }
    }

    // 1 Great
    if (
      partialScore.clearLamp === 5 &&
      partialScore.exScore >= maxExScore - 3
    ) {
      const perfect = maxExScore - 2 - partialScore.exScore
      const score = calcNormalScore(
        objects,
        objects - 1 - perfect,
        perfect,
        1,
        0
      )
      return {
        score,
        rank: getDanceLevel(score),
        clearLamp: Lamp.GFC,
        maxCombo,
      }
    }

    // 1 Good or 1 Miss
    if (partialScore.exScore === maxExScore - 3) {
      const score = calcNormalScore(
        objects,
        objects - 1,
        0,
        0,
        partialScore.clearLamp === 4 ? 1 : 0
      )
      return {
        score,
        rank: isFailed ? 'E' : getDanceLevel(score),
        clearLamp: partialScore.clearLamp ?? (isFailed ? 0 : 1),
        exScore: maxExScore - 3,
        ...(partialScore.clearLamp === 4 ? { maxCombo } : {}),
      }
    }

    return null
  }

  function tryCalcFromGreatFC(): ScoreRecord | null {
    // Try to calc great count from score
    let gr = 0
    /** Perfect: 0, Great: `gr` score */
    let target
    do {
      target = calcNormalScore(objects, objects - ++gr, 0, gr, 0)
    } while (target >= partialScore.score!)
    target = calcNormalScore(objects, objects - --gr, 0, gr, 0)

    // Can calc (Great: 1 or Perfect drop (=Perfect count * 10) less than Great: 1 drop (=baseScore * 0.4 + 10))
    if (
      gr === 1 ||
      (notes - gr) * 10 <
        calcNormalScore(objects, 1, 0, 0, 0) -
          calcNormalScore(objects, 0, 0, 1, 0)
    ) {
      const perfectCount = (target - partialScore.score!) / 10
      return {
        score: partialScore.score!,
        rank: getDanceLevel(partialScore.score!),
        clearLamp: Lamp.GFC,
        exScore: maxExScore - perfectCount - gr * 2,
        maxCombo,
      }
    }

    return null
  }
}

/**
 * Calculate Flare skill score.
 * @param level Level of step chart
 * @param flareRank Flare Rank
 */
export function calcFlareSkill(level: number, flareRank: FlareRank): number {
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
  chart: Pick<StepChart, 'notes' | 'freezeArrow' | 'shockArrow'>,
  score: number,
  clearLamp: ClearLamp = 0
): {
  marvelousOrOk: number
  perfect: number
  great: number
  good: number
  miss: number
}[] {
  score = scoreRecordSchema.shape.score.parse(score)
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
