import { StepChart } from './step-chart'

export type Score = Pick<StepChart, 'songId' | 'playStyle' | 'difficulty'> & {
  score: number
  exScore: number
  clearLamp: ClearLamp | null
  rank: DanceLevel | null
}

/**
 * 0: Failed
 * 1: Assisted Clear
 * 2: Clear
 * 3: Life 4 Clear
 * 4: (Good) Full Combo
 * 5: Great Full Combo
 * 6: Perfect Full Combo
 * 7: Marvelous Full Combo
 */
type ClearLamp = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

type DanceLevel =
  | 'E'
  | 'D'
  | 'D+'
  | 'C-'
  | 'C'
  | 'C+'
  | 'B-'
  | 'B'
  | 'B+'
  | 'A-'
  | 'A'
  | 'A+'
  | 'AA-'
  | 'AA'
  | 'AA+'
  | 'AAA'

const isPositiveInteger = (num: number) => Number.isInteger(num) && num >= 0

export const getDanceLevel = (score: number): DanceLevel => {
  if (!isPositiveInteger(score) || score > 1000000)
    throw new RangeError('score is invalid')
  return score < 550000
    ? 'D'
    : score < 590000
    ? 'D+'
    : score < 600000
    ? 'C-'
    : score < 650000
    ? 'C'
    : score < 690000
    ? 'C+'
    : score < 700000
    ? 'B-'
    : score < 750000
    ? 'B'
    : score < 790000
    ? 'B+'
    : score < 800000
    ? 'A-'
    : score < 850000
    ? 'A'
    : score < 890000
    ? 'A+'
    : score < 900000
    ? 'AA-'
    : score < 950000
    ? 'AA'
    : score < 990000
    ? 'AA+'
    : 'AAA'
}

export const calcScore = (
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Pick<StepChart, 'notes' | 'freezeArrow' | 'shockArrow'>,
  marvelous: number,
  perfect: number,
  great: number,
  good: number,
  ok: number
): number => {
  if (!isPositiveInteger(marvelous))
    throw new RangeError(`invalid marvelous: ${marvelous}`)
  if (!isPositiveInteger(perfect))
    throw new RangeError(`invalid perfect: ${perfect}`)
  if (!isPositiveInteger(great)) throw new RangeError(`invalid great: ${great}`)
  if (!isPositiveInteger(good)) throw new RangeError(`invalid good: ${good}`)
  if (!isPositiveInteger(ok)) throw new RangeError(`invalid ok: ${ok}`)
  if (marvelous + perfect + great + good > notes)
    throw new RangeError(
      `judge count(${
        marvelous + perfect + great + good
      }) is greater than notes(${notes})`
    )
  if (ok > freezeArrow + shockArrow)
    throw new RangeError(
      `ok count(${ok}) is greater than FA+SA count(${freezeArrow + shockArrow})`
    )

  const noteObjects = notes + freezeArrow + shockArrow
  const baseScore = 1000000 / noteObjects
  const rawScore =
    baseScore * (marvelous + ok) +
    (baseScore - 10) * perfect +
    (baseScore * 0.6 - 10) * great +
    (baseScore * 0.2 - 10) * good
  return Math.floor(rawScore / 10) * 10
}

export const calcExScore = (
  marvelous: number,
  perfect: number,
  great: number,
  ok: number
): number => {
  if (!isPositiveInteger(marvelous))
    throw new Error(`invalid marvelous: ${marvelous}`)
  if (!isPositiveInteger(perfect))
    throw new Error(`invalid perfect: ${perfect}`)
  if (!isPositiveInteger(great)) throw new Error(`invalid great: ${great}`)
  if (!isPositiveInteger(ok)) throw new Error(`invalid ok: ${ok}`)

  return marvelous * 3 + ok * 3 + perfect * 2 + great * 1
}
