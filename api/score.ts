import { DanceLevel, DanceLevelList, ScoreSchema } from './db/scores'
import type { StepChartSchema } from './db/songs'
import { hasIntegerProperty, hasStringProperty } from './type-assert'

export type Score = Pick<
  ScoreSchema,
  'score' | 'clearLamp' | 'exScore' | 'maxCombo' | 'rank'
>

export const isScore = (obj: unknown): obj is Score =>
  hasIntegerProperty(obj, 'score', 'clearLamp') &&
  obj.score >= 0 &&
  obj.score <= 1000000 &&
  obj.clearLamp >= 0 &&
  obj.clearLamp <= 7 &&
  (hasIntegerProperty(obj, 'exScore') ||
    (obj as Record<string, unknown>).exScore === undefined) &&
  (hasIntegerProperty(obj, 'maxCombo') ||
    (obj as Record<string, unknown>).maxCombo === undefined) &&
  hasStringProperty(obj, 'rank') &&
  (DanceLevelList as string[]).includes(obj.rank)

export const setValidScoreFromChart = (
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>,
  partialScore: Readonly<Partial<Score>>
): Score => {
  const objects = notes + freezeArrow + shockArrow
  /** Max EX SCORE */
  const maxExScore = objects * 3
  /** Full Combo */
  const maxCombo = notes + shockArrow
  const baseScore = 1000000 / objects

  const isFailed = partialScore.rank === 'E' || partialScore.clearLamp === 0

  if (partialScore.exScore && partialScore.exScore > maxExScore)
    throw new Error(
      `Invalid Score object: exScore(${partialScore.exScore}) is greater than MAX(${maxExScore})`
    )

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

  const result: Score = {
    ...partialScore,
    score: partialScore.score,
    rank: getDanceLevel(partialScore.score),
    clearLamp: partialScore.clearLamp ?? 2, // set "Clear" default
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
    const target = floorScore(1000000 - baseScore + good(baseScore))
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
      partialScore.score! > floorScore(1000000 - baseScore + great(baseScore)) // Score is greater than Gr:1 score
    )
  }

  function isGreatFC() {
    return (
      partialScore.clearLamp === 5 || // ClearLamp is GreatFC
      partialScore.score! > floorScore(1000000 - baseScore + good(baseScore)) // Score is greater than Good:1 score
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
      partialScore.score! >
        floorScore(1000000 - baseScore * 2 - good(baseScore) + great(baseScore)) // Score is greater than Great:1, Good:1 score
    )
  }

  function isMiss1() {
    return (
      partialScore.clearLamp !== 4 &&
      partialScore.clearLamp !== undefined && // Not selected Full combo
      (partialScore.score! >
        floorScore(1000000 - baseScore * 2 + great(baseScore)) || // Score is greater than Great:1, Miss:1
        partialScore.maxCombo === maxCombo) // [Note]: This is NOT Full Combo. (ex. missed last Freeze Arrow)
    )
  }

  function tryCalcFromGreatFC(): Required<Score> | null {
    const dropScore = great(baseScore) - baseScore

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

  function tryCalcFromExScore(): Required<Score> | null {
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
      const score = floorScore(1000000 - baseScore + great(baseScore))
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
      const score = floorScore(1000000 - baseScore + good(baseScore))
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
}

export const getDanceLevel = (score: number): Exclude<DanceLevel, 'E'> => {
  if (!isPositiveInteger(score))
    throw new RangeError(
      `Invalid parameter: score(${score}) should be positive integer or 0.`
    )
  if (score > 1000000)
    throw new RangeError(
      `Invalid parameter: score(${score}) should be less than or equal to 1000000.`
    )
  const rankList = [
    { border: 990000, rank: 'AAA' } as const,
    { border: 950000, rank: 'AA+' } as const,
    { border: 900000, rank: 'AA' } as const,
    { border: 890000, rank: 'AA-' } as const,
    { border: 850000, rank: 'A+' } as const,
    { border: 800000, rank: 'A' } as const,
    { border: 790000, rank: 'A-' } as const,
    { border: 750000, rank: 'B+' } as const,
    { border: 700000, rank: 'B' } as const,
    { border: 690000, rank: 'B-' } as const,
    { border: 650000, rank: 'C+' } as const,
    { border: 600000, rank: 'C' } as const,
    { border: 590000, rank: 'C-' } as const,
    { border: 550000, rank: 'D+' } as const,
  ] as const
  for (const { border, rank } of rankList) {
    if (score >= border) return rank
  }
  return 'D'
}

export const calcScore = (
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>,
  marvelousCount: number,
  perfectCount: number,
  greatCount: number,
  goodCount: number,
  okCount: number
): number => {
  if (!isPositiveInteger(marvelousCount))
    throw new RangeError(
      `Invalid parameter: marvelousCount(${marvelousCount}) should be positive integer or 0.`
    )
  if (!isPositiveInteger(perfectCount))
    throw new RangeError(
      `Invalid parameter: perfectCount(${perfectCount}) should be positive integer or 0.`
    )
  if (!isPositiveInteger(greatCount))
    throw new RangeError(
      `Invalid parameter: greatCount(${greatCount}) should be positive integer or 0.`
    )
  if (!isPositiveInteger(goodCount))
    throw new RangeError(
      `Invalid parameter: goodCount(${goodCount}) should be positive integer or 0.`
    )
  if (!isPositiveInteger(okCount))
    throw new RangeError(
      `Invalid parameter: okCount(${okCount}) should be positive integer or 0.`
    )
  if (marvelousCount + perfectCount + greatCount + goodCount > notes)
    throw new RangeError(
      `Invalid parameter: judge count(${
        marvelousCount + perfectCount + greatCount + goodCount
      }) is greater than notes(${notes})`
    )

  const maxOkCount = freezeArrow + shockArrow
  if (okCount > maxOkCount)
    throw new RangeError(
      `Invalid parameter: okCount(${okCount}) is greater than freezeArrow + shockArrow(${maxOkCount})`
    )

  const noteObjects = notes + maxOkCount
  const baseScore = 1000000 / noteObjects
  const rawScore =
    baseScore * (marvelousCount + okCount) +
    (baseScore - 10) * perfectCount +
    great(baseScore) * greatCount +
    good(baseScore) * goodCount
  return floorScore(rawScore)
}

export const calcExScore = (
  marvelous: number,
  perfect: number,
  great: number,
  ok: number
): number => {
  if (!isPositiveInteger(marvelous))
    throw new Error(
      `Invalid parameter: marvelous(${marvelous}) should be positive integer or 0.`
    )
  if (!isPositiveInteger(perfect))
    throw new Error(
      `Invalid parameter: perfect(${perfect}) should be positive integer or 0.`
    )
  if (!isPositiveInteger(great))
    throw new Error(
      `Invalid parameter: great:(${great}) should be positive integer or 0.`
    )
  if (!isPositiveInteger(ok))
    throw new Error(
      `Invalid parameter: ok(${ok}) should be positive integer or 0.`
    )

  return marvelous * 3 + ok * 3 + perfect * 2 + great * 1
}

const isPositiveInteger = (num: number) => Number.isInteger(num) && num >= 0
const great = (baseScore: number) => baseScore * 0.6 - 10
const good = (baseScore: number) => baseScore * 0.2 - 10
const floorScore = (rawScore: number) => Math.floor(rawScore / 10) * 10
