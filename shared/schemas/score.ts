import type { scores, TimestampColumn } from 'hub:db:schema'
import * as z from 'zod/mini'

import { songSchema } from '#shared/schemas/song'
import { stepChartSchema } from '#shared/schemas/step-chart'
import { userSchema } from '#shared/schemas/user'

/** Enum object for `clearLamp` */
export const ClearLamp = {
  /** Failed */
  Failed: 0,
  /** Clear with Assisted options (CUT, JUMP OFF or FREEZE OFF), or failed on Local Versus (BPL) mode */
  Assisted: 1,
  /** Clear with Normal or FLARE gauge */
  Clear: 2,
  /** Clear with Life 4 gauge */
  Life4: 3,
  /** (Good) Full Combo */
  FC: 4,
  /** Great Full Combo (contains only Great or above) */
  GFC: 5,
  /** Perfect Full Combo (contains only Perfect or above) */
  PFC: 6,
  /** Marvelous Full Combo (contains only Marvelous) */
  MFC: 7,
} as const
type ClearLamp = (typeof ClearLamp)[keyof typeof ClearLamp]
/** Map for {@link ClearLamp} */
export const clearLampMap: ReadonlyMap<number, string> = new Map([
  [0, 'Failed'],
  [1, 'Assisted Clear'],
  [2, 'Clear'],
  [3, 'Life 4'],
  [4, 'Full Combo'],
  [5, 'Great Full Combo'],
  [6, 'Perfect Full Combo'],
  [7, 'Marvelous Full Combo'],
] satisfies [ClearLamp, string][])

const _danceLevels = [
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
  { border: undefined, rank: 'D' },
  { border: undefined, rank: 'E' },
] as const
/** Dance Level List (high to low) */
export const danceLevels = _danceLevels.map(dl => dl.rank)

/** Enum object for `flareRank` */
export const FlareRank = {
  /** No FLARE */
  None: 0,
  /** FLARE I */
  I: 1,
  /** FLARE II */
  II: 2,
  /** FLARE III */
  III: 3,
  /** FLARE IV */
  IV: 4,
  /** FLARE V */
  V: 5,
  /** FLARE VI */
  VI: 6,
  /** FLARE VII */
  VII: 7,
  /** FLARE VIII */
  VIII: 8,
  /** FLARE IX */
  IX: 9,
  /** FLARE EX */
  EX: 10,
} as const

/** Schema for ScoreRecord keys */
export const scoreRecordKeySchema = z.object({
  /**
   * Song ID that depend on official site.
   * @pattern /^[01689bdiloqDIOPQ]{32}$/
   */
  songId: songSchema.shape.id,
  /**
   * Play style
   * @description `1`: SINGLE, `2`: DOUBLE
   */
  playStyle: z.pipe(z.coerce.number(), stepChartSchema.shape.playStyle),
  /**
   * Difficulty
   * @description `0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE
   */
  difficulty: z.pipe(z.coerce.number(), stepChartSchema.shape.difficulty),
  /** User ID (3-32 characters) */
  userId: userSchema.shape.id,
}) satisfies z.ZodMiniType<
  Pick<
    typeof scores.$inferInsert,
    'songId' | 'playStyle' | 'difficulty' | 'userId'
  >
>

/** Schema for ScoreRecord */
export const scoreRecordSchema = z.object({
  /** Normal Score (0-1,000,000) */
  normalScore: z.int().check(z.minimum(0), z.maximum(1000000)),
  /** EX Score */
  exScore: z.pipe(
    z.nullish(z.int().check(z.nonnegative())),
    z.transform(v => v ?? null)
  ),
  /** Max Combo */
  maxCombo: z.pipe(
    z.nullish(z.int().check(z.nonnegative())),
    z.transform(v => v ?? null)
  ),
  /**
   * Clear Lamp
   * @description
   * - `0`: Failed
   * - `1`: Assisted Clear
   * - `2`: Clear
   * - `3`: Life 4 Clear
   * - `4`: Full Combo (Good FC)
   * - `5`: Great Full Combo
   * - `6`: Perfect Full Combo
   * - `7`: Marvelous Full Combo
   */
  clearLamp: z.union(Object.values(ClearLamp).map(v => z.literal(v))),
  /** Dance Level ("AAA", "AA+", "AA", "AA-", ..., "D+", "D", "E") */
  rank: z.union(_danceLevels.map(({ rank }) => z.literal(rank))),
  /**
   * Flare Rank
   * @description
   * - `0`: No FLARE
   * - `1`: FLARE I
   * - `2`: FLARE II
   * - `3`: FLARE III
   * - `4`: FLARE IV
   * - `5`: FLARE V
   * - `6`: FLARE VI
   * - `7`: FLARE VII
   * - `8`: FLARE VIII
   * - `9`: FLARE IX
   * - `10`: FLARE EX
   */
  flareRank: z.union(Object.values(FlareRank).map(v => z.literal(v))),
  /** Flare Skill */
  flareSkill: z.pipe(
    z.nullish(z.int().check(z.nonnegative())),
    z.transform(v => v ?? null)
  ),
}) satisfies z.ZodMiniType<
  Omit<
    typeof scores.$inferInsert,
    keyof ZodInfer<typeof scoreRecordKeySchema> | TimestampColumn
  >
>

export const scoreRecordInputSchema = z.pipe(
  z.object({
    ...z.partial(scoreRecordSchema).shape,
    ...z.omit(scoreRecordKeySchema, { userId: true }).shape,
  }),
  z.transform(value => ({
    ...value,
    exScore: value.exScore ?? null,
    maxCombo: value.maxCombo ?? null,
    flareSkill: value.flareSkill ?? null,
  }))
)

/**
 * Get Dance Level from normal score.
 * @param normalScore Normal Score
 */
export function getDanceLevel(normalScore: number): Exclude<DanceLevel, 'E'> {
  normalScore = scoreRecordSchema.shape.normalScore.parse(normalScore)
  for (const { border, rank } of _danceLevels) {
    if (border !== undefined && normalScore >= border) {
      return rank
    }
  }
  return 'D'
}

/**
 * Calculate normal score from judge counts.
 * @param totalNotes Notes + Freeze Arrow count + Shock Arrow count
 * @param marvelousAndOk Marvelous & OK count
 * @param perfect Perfect count
 * @param great Great count
 * @param good Good count
 * @returns Normal Score
 */
export function calcNormalScore(
  totalNotes: number,
  marvelousAndOk: number,
  perfect: number,
  great: number,
  good: number
): number {
  return (
    Math.floor(
      (100000 * (marvelousAndOk + perfect) + 60000 * great + 20000 * good) /
        totalNotes -
        perfect -
        great -
        good
    ) * 10
  )
}
