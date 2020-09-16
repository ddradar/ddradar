import type { ClearLamp, Rank, ScoreSchema } from './db/scores'
import { StepChartSchema } from './db/songs'

/**
 * Object type returned by `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getChartScore/README.md
 */
export type ScoreResponse = Omit<ScoreSchema, 'id' | 'isPublic'>

/**
 * Request body to `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/postChartScore/README.md
 */
export type ScoreRequest = Pick<
  ScoreSchema,
  'score' | 'exScore' | 'maxCombo' | 'clearLamp' | 'rank'
>

/**
 * Request body to `/api/v1/scores/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/postSongScores/README.md
 */
export type ScoreListRequest = Omit<
  ScoreSchema,
  'id' | 'isPublic' | 'userId' | 'userName' | 'songId' | 'songName' | 'level'
> & { topScore?: number }

export const clearLampList: Record<ClearLamp, string> = {
  '0': 'Failed',
  '1': 'Assisted Clear',
  '2': 'Clear',
  '3': 'Life 4',
  '4': 'Full Combo',
  '5': 'Great Full Combo',
  '6': 'Perfect Full Combo',
  '7': 'Marvelous Full Combo',
}

export const danceLevelList = [
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

/** Calcurate DanceLevel from score. */
export function getDanceLevel(score: number): Exclude<Rank, 'E'> {
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
    if (score >= border) return rank
  }
  return 'D'
}

export function completeScoreFromChart(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  partialScore: Readonly<Partial<ScoreRequest>>
): ScoreRequest {
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

  const result: ScoreRequest = {
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

  /* eslint-disable @typescript-eslint/no-non-null-assertion -- already checked before these methods called */
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

  function tryCalcFromGreatFC(): Required<ScoreRequest> | null {
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
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  function tryCalcFromExScore(): Required<ScoreRequest> | null {
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
        exScore: maxExScore - dropCount,
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
