import { z } from 'zod'

type KeyOfMap<T> = T extends Map<infer K, unknown> ? K : never

const _playStyles = new Map([
  [1, 'SINGLE'],
  [2, 'DOUBLE'],
] as const)
/** `1`: SINGLE, `2`: DOUBLE */
export type PlayStyle = KeyOfMap<typeof _playStyles>

const _difficulties = new Map([
  [0, 'BEGINNER'],
  [1, 'BASIC'],
  [2, 'DIFFICULT'],
  [3, 'EXPERT'],
  [4, 'CHALLENGE'],
] as const)
/** 0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE */
export type Difficulty = KeyOfMap<typeof _difficulties>

export const stepChartSchema = z.object({
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: z.union([..._playStyles.keys().map((k) => z.literal(k))]),
  /** Difficulty (0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE) */
  difficulty: z.union([..._difficulties.keys().map((k) => z.literal(k))]),
  /** Min BPM, Core BPM, Max BPM. */
  bpm: z.tuple([
    z.number().int().positive(),
    z.number().int().positive(),
    z.number().int().positive(),
  ]),
  /** Chart level */
  level: z.number().int().min(1).max(20),
  /** Normal arrow count. (Jump = 1 count) */
  notes: z.optional(z.number().int().positive()),
  /** Freeze Arrow count. */
  freezes: z.optional(z.number().int().nonnegative()),
  /** Shock Arrow count. */
  shocks: z.optional(z.number().int().nonnegative()),
  /** Groove Radar data (if available) */
  radar: z.optional(
    z.object({
      stream: z.number().int().nonnegative(),
      voltage: z.number().int().nonnegative(),
      air: z.number().int().nonnegative(),
      freeze: z.number().int().nonnegative(),
      chaos: z.number().int().nonnegative(),
    }),
  ),
})
export type StepChart = z.infer<typeof stepChartSchema>
export type GrooveRadar = Required<StepChart>['radar']
