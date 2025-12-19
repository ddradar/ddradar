import * as z from 'zod/mini'

import type { charts, TimestampColumn } from '~~/server/db/schema'
import { getEnumKey } from '~~/shared/utils/enum'

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

/** Mapping of chart ID to `[PlayStyle, Difficulty]` */
export const Chart = {
  bSP: [PlayStyle.SINGLE, Difficulty.BEGINNER],
  BSP: [PlayStyle.SINGLE, Difficulty.BASIC],
  DSP: [PlayStyle.SINGLE, Difficulty.DIFFICULT],
  ESP: [PlayStyle.SINGLE, Difficulty.EXPERT],
  CSP: [PlayStyle.SINGLE, Difficulty.CHALLENGE],
  BDP: [PlayStyle.DOUBLE, Difficulty.BASIC],
  DDP: [PlayStyle.DOUBLE, Difficulty.DIFFICULT],
  EDP: [PlayStyle.DOUBLE, Difficulty.EXPERT],
  CDP: [PlayStyle.DOUBLE, Difficulty.CHALLENGE],
} as const

/** Groove Radar data */
export type GrooveRadar = {
  stream: number
  voltage: number
  air: number
  freeze: number
  chaos: number
}
/** Zod schema for `StepChart` (excepts `id`) */
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
  bpm: z.union([
    z.tuple([z.int().check(z.positive())]),
    z.tuple([
      z.int().check(z.positive()),
      z.int().check(z.positive()),
      z.int().check(z.positive()),
    ]),
  ]),
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
}) satisfies z.ZodMiniType<
  Omit<typeof charts.$inferInsert, 'id' | TimestampColumn>
>
export type StepChart = ZodInfer<typeof stepChartSchema>

/**
 * Get the display name of a step chart.
 * @param chart Step chart
 * @returns Display name of the chart in the format of "PLAYSTYLE/DIFFICULTY"
 */
export function getChartName(
  chart: Readonly<Pick<StepChart, 'playStyle' | 'difficulty'>>
): string {
  const playStyleName = getEnumKey(PlayStyle, chart.playStyle) ?? 'UNKNOWN'
  const difficultyName = getEnumKey(Difficulty, chart.difficulty) ?? 'UNKNOWN'
  return `${playStyleName}/${difficultyName}`
}

/**
 * Compare two step charts for equality.
 * @param left Step chart on the left side
 * @param right Step chart on the right side
 * @returns Whether the two step charts are equal
 */
export function chartEquals(
  left: Readonly<Pick<StepChart, 'playStyle' | 'difficulty'>>,
  right: Readonly<Pick<StepChart, 'playStyle' | 'difficulty'>>
): boolean {
  return (
    left.playStyle === right.playStyle && left.difficulty === right.difficulty
  )
}
