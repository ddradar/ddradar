import * as z from 'zod/mini'

import type { charts, TimestampColumn } from '~~/server/db/schema'

type KeyOfMap<T> = T extends Map<infer K, unknown> ? K : never

const _playStyles = new Map([
  [1, 'SINGLE'],
  [2, 'DOUBLE'],
] as const)
/** `1`: SINGLE, `2`: DOUBLE */
export type PlayStyle = KeyOfMap<typeof _playStyles>
export const playStyleMap: ReadonlyMap<number, string> = _playStyles

const _difficulties = new Map([
  [0, 'BEGINNER'],
  [1, 'BASIC'],
  [2, 'DIFFICULT'],
  [3, 'EXPERT'],
  [4, 'CHALLENGE'],
] as const)
/** 0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE */
export type Difficulty = KeyOfMap<typeof _difficulties>
export const difficultyMap: ReadonlyMap<number, string> = _difficulties

export const stepChartSchema = z.object({
  /**
   * Play style
   * @description `1`: SINGLE, `2`: DOUBLE
   */
  playStyle: z.union([..._playStyles.keys().map(k => z.literal(k))]),
  /** Difficulty (0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE) */
  difficulty: z.union([..._difficulties.keys().map(k => z.literal(k))]),
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
  z.infer<typeof stepChartSchema>
export type GrooveRadar = NonNullable<z.infer<typeof stepChartSchema>['radar']>

export function chartEquals(
  left: Pick<StepChart, 'playStyle' | 'difficulty'>,
  right: Pick<StepChart, 'playStyle' | 'difficulty'>
): boolean {
  return (
    left.playStyle === right.playStyle && left.difficulty === right.difficulty
  )
}
