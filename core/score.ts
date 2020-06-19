import type { StepChart } from './'
import { DanceLevel, DanceLevelList, ScoreSchema } from './db/scores'
import { hasIntegerProperty, hasStringProperty } from './type-assert'

export type ScoreKey = Pick<
  ScoreSchema,
  'userId' | 'songId' | 'playStyle' | 'difficulty'
>
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
  }: Pick<StepChart, 'notes' | 'freezeArrow' | 'shockArrow'>,
  incompleteScore: Partial<Score>
): Score => {
  const objects = notes + freezeArrow + shockArrow
  /** Max EX SCORE */
  const exScore = objects * 3
  /** Full Combo */
  const maxCombo = notes + shockArrow
  const baseScore = 1000000 / objects

  const score = incompleteScore.score
  const clearLamp = incompleteScore.clearLamp
  const isFailed = incompleteScore.rank === 'E' || clearLamp === 0

  if (incompleteScore.exScore && incompleteScore.exScore > exScore)
    throw new Error(
      `Invalid Score object: exScore(${incompleteScore.exScore}) is greater than MAX(${exScore})`
    )

  // MFC
  if (
    clearLamp === 7 ||
    score === 1000000 ||
    incompleteScore.exScore === exScore
  ) {
    return {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore,
      maxCombo,
    }
  }

  // Patterns that can be calculated from EX SCORE
  // 1 Perfect
  if (incompleteScore.exScore === exScore - 1) {
    return {
      score: 999990,
      rank: 'AAA',
      clearLamp: 6,
      exScore: exScore - 1,
      maxCombo,
    }
  }
  // X Perfects
  if (clearLamp === 6 && incompleteScore.exScore) {
    const dropCount = exScore - incompleteScore.exScore
    return {
      score: 1000000 - dropCount * 10,
      rank: 'AAA',
      clearLamp: 6,
      exScore: exScore - dropCount,
      maxCombo,
    }
  }
  // 1 Great 0 Perfect
  if (clearLamp === 5 && incompleteScore.exScore === exScore - 2) {
    const score = floorScore(1000000 - baseScore + great(baseScore))
    return {
      score,
      rank: getDanceLevel(score),
      clearLamp: 5,
      exScore: exScore - 2,
      maxCombo,
    }
  }
  // 1 Good 0 Great 0 Perfect
  if (clearLamp === 4 && incompleteScore.exScore === exScore - 3) {
    const score = floorScore(1000000 - baseScore + good(baseScore))
    return {
      score,
      rank: getDanceLevel(score),
      clearLamp: 4,
      exScore: exScore - 3,
      maxCombo,
    }
  }

  if (score === undefined)
    throw new Error('Cannot guess Score object. set score property')

  // Currently, 0 point can only be obtained by the following methods:
  // 1. Failed
  // 2. CHAOS [SP-BEGINNER] with CUT1 (= Assisted Clear)
  // 3. ようこそジャパリパークへ [DP-CHALLENGE] with JUMP OFF (= Assisted Clear)
  if (score === 0) {
    return {
      score: 0,
      rank: isFailed ? 'E' : 'D',
      clearLamp: isFailed ? 0 : 1,
      exScore: 0,
      maxCombo: 0,
    }
  }

  // PFC
  // ClearLamp is PFC or Score is greater than Gr:1 score
  if (
    clearLamp === 6 ||
    score > floorScore(1000000 - baseScore + great(baseScore))
  ) {
    const dropCount = (1000000 - score) / 10
    return {
      score,
      rank: getDanceLevel(score), // AAA or AA+
      clearLamp: 6,
      exScore: exScore - dropCount,
      maxCombo,
    }
  }

  // Great Full Combo
  // ClearLamp is GreatFC or Score is greater than Gd:1 score
  if (
    clearLamp === 5 ||
    score > floorScore(1000000 - baseScore + good(baseScore))
  ) {
    const dropScore = great(baseScore) - baseScore

    // Try to calc great count from score
    let greatCount = 0
    while (floorScore(1000000 + dropScore * (greatCount + 1)) >= score) {
      greatCount++
    }

    // Can calc
    if (greatCount === 1 || (notes - greatCount) * 10 < -dropScore) {
      /** Perfect:0, Great: greatCount Score */
      const target = floorScore(1000000 + dropScore * greatCount)
      const perfectCount = (target - score) / 10
      return {
        score,
        rank: getDanceLevel(score),
        clearLamp: 5,
        exScore: exScore - perfectCount - greatCount * 2,
        maxCombo,
      }
    }

    return {
      ...incompleteScore,
      score,
      rank: getDanceLevel(score),
      clearLamp: 5,
      maxCombo,
    }
  }

  // Good Full Combo
  // ClearLamp is GoodFC or Score is greater than Miss:1 score
  if (clearLamp === 4 || score > floorScore(1000000 - baseScore)) {
    // 1 Good 0 Great
    if (
      clearLamp === 4 &&
      score >
        floorScore(1000000 - baseScore * 2 - good(baseScore) + great(baseScore))
    ) {
      /** Perfect:0, Good:1 Score */
      const target = floorScore(1000000 - baseScore + good(baseScore))
      const perfectCount = (target - score) / 10
      const calcedExScore = exScore - 3 - perfectCount
      return {
        score,
        rank: getDanceLevel(score),
        clearLamp: 4,
        exScore: calcedExScore,
        maxCombo,
      }
    }

    return {
      ...incompleteScore,
      score,
      rank: getDanceLevel(score),
      clearLamp: 4,
      maxCombo,
    }
  }

  // 1 Miss 0 Good 0 Great
  if (
    clearLamp !== undefined && // Not selected Full combo
    (score > floorScore(1000000 - baseScore * 2 + great(baseScore)) || // Score is greater than 1 Miss, 1 Great
      incompleteScore.maxCombo === maxCombo) // This is NOT Full Combo. (ex. missed last FA)
  ) {
    /** Miss:1 score */
    const target = floorScore(1000000 - baseScore)
    const perfectCount = (target - score) / 10
    return {
      ...incompleteScore,
      score,
      rank: isFailed ? 'E' : getDanceLevel(score),
      clearLamp: isFailed ? 0 : clearLamp,
      exScore: exScore - 3 - perfectCount,
    }
  }

  return {
    ...incompleteScore,
    score,
    rank: isFailed ? 'E' : getDanceLevel(score),
    clearLamp: isFailed ? 0 : clearLamp ?? 2, // set "Clear" default
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
  if (score >= 990000) return 'AAA'
  if (score >= 890000) {
    if (score >= 950000) return 'AA+'
    if (score >= 900000) return 'AA'
    return 'AA-'
  }
  if (score >= 790000) {
    if (score >= 850000) return 'A+'
    if (score >= 800000) return 'A'
    return 'A-'
  }
  if (score >= 690000) {
    if (score >= 750000) return 'B+'
    if (score >= 700000) return 'B'
    return 'B-'
  }
  if (score >= 590000) {
    if (score >= 650000) return 'C+'
    if (score >= 600000) return 'C'
    return 'C-'
  }
  if (score >= 550000) return 'D+'
  return 'D'
}

export const calcScore = (
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Pick<StepChart, 'notes' | 'freezeArrow' | 'shockArrow'>,
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
