import * as z from 'zod/mini'

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
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: z.union([..._playStyles.keys().map(k => z.literal(k))]),
  /** Difficulty (0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE) */
  difficulty: z.union([..._difficulties.keys().map(k => z.literal(k))]),
  /** Min BPM, Core BPM, Max BPM. */
  bpm: z.tuple([
    z.int().check(z.positive()),
    z.int().check(z.positive()),
    z.int().check(z.positive()),
  ]),
  /** Chart level */
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
export type StepChart = z.infer<typeof stepChartSchema>
export type GrooveRadar = NonNullable<StepChart['radar']>
