import {
  calcNormalScore,
  ClearLamp,
  FlareRank,
  getDanceLevel,
} from '~~/shared/types/score'
import { stepChartSchema } from '~~/shared/types/step-chart'

type StepChartWithNotes = NonNullableProps<
  Pick<StepChart, 'notes' | 'freezes' | 'shocks'>
>
/**
 * Returns whether the given step chart has notes info.
 * @param chart step chart info
 */
export function hasNotesInfo(
  chart: Partial<Pick<StepChart, 'notes' | 'freezes' | 'shocks'>>
): chart is StepChartWithNotes {
  return (
    typeof chart.notes === 'number' &&
    typeof chart.freezes === 'number' &&
    typeof chart.shocks === 'number'
  )
}

/**
 * Calculate Flare skill score.
 * @param level Level of step chart
 * @param flareRank Flare Rank
 */
export function calcFlareSkill(
  level: StepChart['level'],
  flareRank: ScoreRecord['flareRank']
): number {
  level = stepChartSchema.shape.level.parse(level)
  const baseScores = [
    145, 155, 170, 185, 205, 230, 255, 290, 335, 400, 465, 510, 545, 575, 600,
    620, 635, 650, 665,
  ]
  return Math.floor((baseScores[level - 1] ?? 0) * (flareRank * 0.06 + 1))
}

/**
 * Calculate MAX score from chart info.
 * @param chart Step chart notes info
 */
export function calcMaxScore(
  chart: Readonly<StepChartWithNotes>
): NonNullableProps<Omit<ScoreRecord, 'flareSkill' | 'flareRank'>> {
  return {
    normalScore: 1000000,
    exScore: (chart.notes + chart.freezes + chart.shocks) * 3,
    maxCombo: chart.notes + chart.shocks,
    clearLamp: ClearLamp.MFC,
    rank: 'AAA',
  }
}

/**
 * Check whether the given score record is valid for the given step chart.
 * @param chart step chart info
 * @param score score to validate
 * @returns Whether the score record is valid for the given chart
 */
export function isValidScoreRecord(
  chart: Readonly<StepChartWithNotes>,
  score: Readonly<ScoreRecord>
) {
  const max = calcMaxScore(chart)

  if (score.exScore) {
    if (
      score.exScore > max.exScore ||
      (score.clearLamp !== ClearLamp.MFC && score.exScore === max.exScore) || // EX SCORE is MAX, but not MFC
      (score.clearLamp !== ClearLamp.PFC &&
        score.exScore === max.exScore - 1) || // EX SCORE is Perfect:1, but not PFC
      (score.clearLamp < ClearLamp.GFC && score.exScore === max.exScore - 2) // EX SCORE is Perfect:2 or Great:1, but not GFC or PFC
    )
      return false
  }

  // Do not treat (maxCombo = fullCombo count) as FULL COMBO because "MAX COMBO is fullCombo, but not FC" pattern is exists.
  // ex. missed last Freeze Arrow
  return (score.maxCombo ?? 0) <= max.maxCombo
}

/**
 * Fill missing `ScoreRecord` properties from `StepChart` and partial `ScoreRecord`.
 * @param chart step chart info
 * @param partialScore partial score info
 * @returns Filled `ScoreRecord`
 */
export function fillScoreRecordFromChart(
  chart: Readonly<StepChartWithNotes>,
  partialScore: Readonly<Partial<ScoreRecord>>
): ScoreRecord {
  const objects = chart.notes + chart.freezes + chart.shocks
  const max = { ...calcMaxScore(chart), flareRank: FlareRank.None }

  if (isMFC()) return { ...max, ...partialScore }

  const scoreFromEx = tryCalcNormalScoreFromExScore()
  if (scoreFromEx) {
    return {
      ...scoreFromEx,
      flareRank: FlareRank.None,
      ...partialScore,
    }
  }

  if (partialScore.normalScore === undefined)
    throw new Error('Cannot guess Score object. set normalScore property')

  const result: ScoreRecord = {
    rank: getDanceLevel(partialScore.normalScore),
    clearLamp: ClearLamp.Clear,
    flareRank: FlareRank.None,
    normalScore: partialScore.normalScore,
    ...partialScore,
  }

  if (isPFC()) {
    result.clearLamp = ClearLamp.PFC
    result.maxCombo = max.maxCombo
    const dropCount = (1000000 - result.normalScore) / 10
    return {
      ...result,
      exScore: Math.max(max.exScore - dropCount, result.exScore ?? 0),
    }
  }

  if (isGFC()) {
    return {
      ...result,
      clearLamp: ClearLamp.GFC,
      maxCombo: max.maxCombo,
      ...tryCalcExScoreFromGreatFC(),
    }
  }

  if (isFC()) {
    // Great:0, Good:1
    if (
      partialScore.clearLamp === ClearLamp.FC &&
      result.normalScore > calcNormalScore(objects, objects - 2, 0, 1, 1)
    ) {
      /** Perfect:0, Great:0, Good:1 Score */
      const target = calcNormalScore(objects, objects - 1, 0, 0, 1)
      const perfectCount = (target - result.normalScore) / 10
      return {
        ...result,
        clearLamp: ClearLamp.FC,
        maxCombo: max.maxCombo,
        exScore: max.exScore - 3 - perfectCount,
      }
    }
    return { ...result, clearLamp: ClearLamp.FC, maxCombo: max.maxCombo }
  }

  if (isFailed()) {
    result.clearLamp = ClearLamp.Failed
    result.rank = 'E'
  }

  // Currently, 0 point can only be obtained by the following methods:
  // 1. Failed
  // 2. CHAOS [SP-BEGINNER] with CUT1 (= Assisted Clear)
  // 3. Flare gauge clear (= Clear)
  //     - ex. FLARE I allows up to 66 miss, so 66 or less notes chart can be cleared with 0 point
  if (result.normalScore === 0) {
    result.exScore = 0
    result.maxCombo = 0
    if (result.clearLamp !== ClearLamp.Failed) {
      result.clearLamp = result.flareRank ? ClearLamp.Clear : ClearLamp.Assisted
      result.rank = 'D'
    }
    return result
  }

  if (isMiss1()) {
    /** Perfect:0, Great:0, Good:0, Miss:1 score */
    const target = calcNormalScore(objects, objects - 1, 0, 0, 0)
    const perfectCount = (target - result.normalScore) / 10
    result.exScore = max.exScore - 3 - perfectCount
  }

  return result

  /** Returns whether the `partialScore` is a Marvelous Full Combo (MFC) or not. */
  function isMFC() {
    return (
      partialScore.clearLamp === ClearLamp.MFC ||
      partialScore.normalScore === 1000000 ||
      partialScore.exScore === max.exScore
    )
  }

  /** Returns whether the `partialScore` is a Perfect Full Combo (PFC) or not. */
  function isPFC() {
    return (
      partialScore.clearLamp === ClearLamp.PFC ||
      partialScore.normalScore! > calcNormalScore(objects, objects - 1, 0, 1, 0) // Score is greater than Great:1 score
    )
  }

  /** Returns whether the `partialScore` is a Great Full Combo (GFC) or not. */
  function isGFC() {
    return (
      partialScore.clearLamp === ClearLamp.GFC ||
      partialScore.normalScore! > calcNormalScore(objects, objects - 1, 0, 0, 1) // Score is greater than Good:1 score
    )
  }

  /** Returns whether the `partialScore` is a Full Combo (FC) or not. */
  function isFC() {
    return (
      partialScore.clearLamp === ClearLamp.FC ||
      partialScore.normalScore! > calcNormalScore(objects, objects - 1, 0, 0, 0) // Score is greater than Miss:1 score
    )
  }

  /** Returns whether the `partialScore` is a failed score or not. */
  function isFailed() {
    return (
      partialScore.rank === 'E' || partialScore.clearLamp === ClearLamp.Failed
    )
  }

  /** Returns whether the `partialScore` is (Perfect:X, Miss:1) or not. */
  function isMiss1() {
    return (
      (partialScore.clearLamp ?? ClearLamp.Clear) < ClearLamp.FC && // Not selected Full combo
      (partialScore.normalScore! >
        calcNormalScore(objects, objects - 2, 0, 1, 0) || // Score is greater than Great:1, Miss:1
        partialScore.maxCombo === max.maxCombo) // [Note]: This is NOT Full Combo. (ex. missed last Freeze Arrow)
    )
  }

  /** Try to get score info from `exScore`. */
  function tryCalcNormalScoreFromExScore(): Omit<
    ScoreRecord,
    'flareSkill' | 'flareRank'
  > | null {
    if (typeof partialScore.exScore !== 'number') return null

    // Perfect:1
    if (partialScore.exScore === max.exScore - 1) {
      return {
        normalScore: 999990,
        rank: 'AAA',
        clearLamp: ClearLamp.PFC,
        exScore: max.exScore - 1,
        maxCombo: max.maxCombo,
      }
    }

    // Perfect:X
    if (isPFC()) {
      const perfectCount = max.exScore - partialScore.exScore
      return {
        normalScore: 1000000 - perfectCount * 10,
        rank: getDanceLevel(1000000 - perfectCount * 10),
        clearLamp: ClearLamp.PFC,
        exScore: Math.max(max.exScore - perfectCount, partialScore.exScore),
        maxCombo: max.maxCombo,
      }
    }

    // Perfect:1 or 0, Great:1
    if (
      partialScore.clearLamp === ClearLamp.GFC &&
      partialScore.exScore >= max.exScore - 3
    ) {
      const perfectCount = max.exScore - 2 - partialScore.exScore
      const normalScore = calcNormalScore(
        objects,
        objects - 1 - perfectCount,
        perfectCount,
        1,
        0
      )
      return {
        normalScore,
        rank: getDanceLevel(normalScore),
        clearLamp: ClearLamp.GFC,
        maxCombo: max.maxCombo,
      }
    }

    // Good:1 or Miss:1
    if (partialScore.exScore === max.exScore - 3) {
      const normalScore = calcNormalScore(
        objects,
        objects - 1,
        0,
        0,
        partialScore.clearLamp === 4 ? 1 : 0
      )
      return {
        normalScore,
        rank: isFailed() ? 'E' : getDanceLevel(normalScore),
        clearLamp: partialScore.clearLamp ?? (isFailed() ? 0 : 1),
        ...(partialScore.clearLamp === ClearLamp.FC
          ? { maxCombo: max.maxCombo }
          : {}),
      }
    }
    return null
  }

  /** Try to get `exScore` from Great Full Combo (GFC) score. */
  function tryCalcExScoreFromGreatFC() {
    if (partialScore.clearLamp !== ClearLamp.GFC || partialScore.exScore)
      return null
    // Try to calc great count from score
    let gr = 0
    /** Perfect:0, Great:`gr` score */
    let target
    do {
      target = calcNormalScore(objects, objects - ++gr, 0, gr, 0)
    } while (target >= partialScore.normalScore!)
    target = calcNormalScore(objects, objects - --gr, 0, gr, 0)

    // Can calc (Great:1 or Perfect drop (= Perfect count * 10) less than Great: 1 drop (= baseScore * 0.4 + 10))
    if (
      gr === 1 ||
      (chart.notes - gr) * 10 <
        calcNormalScore(objects, 1, 0, 0, 0) -
          calcNormalScore(objects, 0, 0, 1, 0)
    ) {
      const perfectCount = (target - partialScore.normalScore!) / 10
      return { exScore: max.exScore - perfectCount - gr * 2 }
    }

    return null
  }
}
