import { StepChartSchema } from '@core/db/songs'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

/** 0: Failed, 1: Assisted Clear 2: Clear, 3: LIFE4, 4: Good FC (Full Combo), 5: Great FC, 6: PFC, 7: MFC */
export type ClearLamp = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Object type returned by `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getChartScore/README.md
 */
export type UserScore = {
  userId: string
  userName: string
  /** Song id that depend on official site. ^([01689bdiloqDIOPQ]*){32}$ */
  songId: string
  songName: string
  playStyle: 1 | 2
  difficulty: 0 | 1 | 2 | 3 | 4
  level: number
  /** Normal score */
  score: number
  exScore?: number
  maxCombo?: number
  /** 0: Failed, 1: Assisted Clear 2: Clear, 3: LIFE4, 4: Good FC (Full Combo), 5: Great FC, 6: PFC, 7: MFC */
  clearLamp: ClearLamp
  /** Clear rank (E-AAA) */
  rank: string
}

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

/**
 * Request body to `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/postChartScore/README.md
 */
export type Score = Pick<
  UserScore,
  'score' | 'exScore' | 'maxCombo' | 'clearLamp' | 'rank'
>

/**
 * Request body to `/api/v1/scores/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/postSongScores/README.md
 */
export type ChartScore = Omit<
  UserScore,
  'userId' | 'userName' | 'songId' | 'songName' | 'level'
> & { topScore?: number }

/**
 * Calcurate DanceLevel from score.
 * @see https://github.com/ddradar/ddradar/blob/master/api/score.ts
 */
export function getDanceLevel(score: number) {
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

export function setValidScoreFromChart(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  partialScore: Readonly<Partial<Score>>
): Score {
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

  const result: Score = {
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

  function tryCalcFromGreatFC(): Required<Score> | null {
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
 * Call "Get Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getChartScore
 */
export function getChartScore(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  songId: string,
  playStyle: 1 | 2,
  difficulty: 0 | 1 | 2 | 3 | 4,
  scope?: 'private' | 'medium' | 'full'
) {
  const query = scope ? `?scope=${scope}` : ''
  return $http.$get<UserScore[]>(
    `${apiPrefix}/scores/${songId}/${playStyle}/${difficulty}${query}`
  )
}

/**
 * Call "Get Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getChartScore
 */
export function postChartScore(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  songId: string,
  playStyle: 1 | 2,
  difficulty: 0 | 1 | 2 | 3 | 4,
  score: Score
) {
  return $http.$post(
    `${apiPrefix}/scores/${songId}/${playStyle}/${difficulty}`,
    score
  )
}

/**
 * Call "Delete Chart Score" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/deleteChartScore
 */
export function deleteChartScore(
  $http: Pick<NuxtHTTPInstance, 'delete'>,
  songId: string,
  playStyle: 1 | 2,
  difficulty: 0 | 1 | 2 | 3 | 4
) {
  return $http.delete(`/api/v1/scores/${songId}/${playStyle}/${difficulty}`)
}

/**
 * Call "Post Song Scores" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/postSongScores
 */
export function postSongScores(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  songId: string,
  scores: ChartScore[]
) {
  return $http.$post<UserScore[]>(`${apiPrefix}/scores/${songId}`, scores)
}
