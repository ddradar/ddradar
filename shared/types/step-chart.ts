import * as z from 'zod/mini'

import type { charts, TimestampColumn } from '~~/server/db/schema'

/** Enum object for `playStyle` */
export const PlayStyle = {
  SINGLE: 1,
  DOUBLE: 2,
} as const

/** Enum object for `difficulty` */
export const Difficulty = {
  BEGINNER: 0,
  BASIC: 1,
  DIFFICULT: 2,
  EXPERT: 3,
  CHALLENGE: 4,
} as const

/** Schema for StepChart */
export const stepChartSchema = z.object({
  /**
   * Play style
   * @description `1`: SINGLE, `2`: DOUBLE
   */
  playStyle: z.union(Object.values(PlayStyle).map(k => z.literal(k))),
  /**
   * Difficulty
   * @description `0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE
   */
  difficulty: z.union(Object.values(Difficulty).map(k => z.literal(k))),
  /**
   * Chart BPM range.
   * @description
   * - 1-tuple: [fixed BPM]
   * - 2-tuple: [Min BPM, Max BPM] (unused because cannot detect Core BPM)
   * - 3-tuple: [Min BPM, Core BPM, Max BPM]
   */
  bpm: z
    .array(z.int().check(z.positive()))
    .check(z.minLength(1), z.maxLength(3)),
  /** Chart level (1-20) */
  level: z.int().check(z.minimum(1), z.maximum(20)),
  /** Normal arrow count. (Jump = 1 count) */
  notes: z.nullish(z.int().check(z.positive())),
  /** Freeze Arrow count. */
  freezes: z.nullish(z.int().check(z.nonnegative())),
  /** Shock Arrow count. */
  shocks: z.nullish(z.int().check(z.nonnegative())),
  /** Groove Radar data (if available) */
  radar: z.nullish(
    z.object({
      stream: z.int().check(z.nonnegative()),
      voltage: z.int().check(z.nonnegative()),
      air: z.int().check(z.nonnegative()),
      freeze: z.int().check(z.nonnegative()),
      chaos: z.int().check(z.nonnegative()),
    })
  ),
})
export type StepChart = Omit<
  typeof charts.$inferSelect,
  'id' | TimestampColumn
> &
  ZodInfer<typeof stepChartSchema>
export type GrooveRadar = NonNullable<ZodInfer<typeof stepChartSchema>['radar']>

/**
 * Get the display name of a step chart.
 * @param chart Step chart
 * @returns Display name of the chart in the format of "PLAYSTYLE/DIFFICULTY"
 */
export function getChartName(
  chart: Pick<StepChart, 'playStyle' | 'difficulty'>
): string {
  const playStyleName = getKeyByValue(PlayStyle, chart.playStyle) ?? 'UNKNOWN'
  const difficultyName =
    getKeyByValue(Difficulty, chart.difficulty) ?? 'UNKNOWN'
  return `${playStyleName}/${difficultyName}`

  function getKeyByValue<T>(
    obj: Record<string, T>,
    value: T
  ): string | undefined {
    return Object.entries(obj).find(([, v]) => v === value)?.[0]
  }
}

/**
 * Compare two step charts for equality.
 * @param left Step chart on the left side
 * @param right Step chart on the right side
 * @returns Whether the two step charts are equal
 */
export function chartEquals(
  left: Pick<StepChart, 'playStyle' | 'difficulty'>,
  right: Pick<StepChart, 'playStyle' | 'difficulty'>
): boolean {
  return (
    left.playStyle === right.playStyle && left.difficulty === right.difficulty
  )
}
