import { db } from '@nuxthub/db'
import { charts, scores } from '@nuxthub/db/schema'
import { and, desc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm'
import { createError, defineEventHandler, getValidatedQuery } from 'nuxt/server'
import * as z from 'zod/mini'

import { buildPagenation } from '#server/utils/pagination'
import { getValidatedParams } from '#server/utils/router'
import {
  ClearLamp,
  danceLevels,
  FlareRank,
  scoreRecordSchema,
} from '#shared/schemas/score'
import { songSchema } from '#shared/schemas/song'
import {
  Difficulty,
  PlayStyle,
  stepChartSchema,
} from '#shared/schemas/step-chart'
import { userIdSchema } from '#shared/schemas/user'
import { range, singleOrArray } from '#shared/utils'

/** Schema for query parameters */
const querySchema = z.compile(
  z.object({
    /** Song ID */
    id: z.optional(songSchema.shape.id),
    /**
     * Play Style (default: all styles)
     * @description `1`: SINGLE, `2`: DOUBLE
     */
    style: z.catch(
      singleOrArray(z.pipe(z.coerce.number(), stepChartSchema.shape.playStyle)),
      [PlayStyle.SINGLE, PlayStyle.DOUBLE]
    ),
    /**
     * Difficulty (default: all difficulties)
     * @description `0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE
     */
    diff: z.catch(
      singleOrArray(
        z.pipe(z.coerce.number(), stepChartSchema.shape.difficulty)
      ),
      range(Difficulty.BEGINNER, Difficulty.CHALLENGE)
    ),
    /** Level (default: all levels) */
    lv: z.catch(
      singleOrArray(z.pipe(z.coerce.number(), stepChartSchema.shape.level)),
      range(1, 20)
    ),
    /**
     * Clear Lamp (default: all lamps)
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
    clear: z.catch(
      singleOrArray(
        z.pipe(z.coerce.number(), scoreRecordSchema.shape.clearLamp)
      ),
      range(ClearLamp.Failed, ClearLamp.MFC)
    ),
    /**
     * Flare Rank (default: all ranks)
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
    flare: z.catch(
      singleOrArray(
        z.pipe(z.coerce.number(), scoreRecordSchema.shape.flareRank)
      ),
      range(FlareRank.None, FlareRank.EX)
    ),
    /** Dance Level (default: all ranks) */
    rank: z.catch(singleOrArray(scoreRecordSchema.shape.rank), danceLevels),
    /** Maximum number of items to return (default: 50, maximum: 100) */
    limit: z.catch(
      z.coerce.number().check(z.int(), z.positive(), z.maximum(100)),
      50
    ),
    /** Number of items to skip. use for pagination (default: 0) */
    offset: z.catch(z.coerce.number().check(z.int(), z.nonnegative()), 0),
  })
)

/**
 * Retrieve a paginated list of scores for a specific user.
 * Only public profiles are accessible unless the requester is the user themselves.
 * Supports filtering by song, play style, difficulty, level, clear lamp, flare rank, and dance rank.
 */
export default defineEventHandler(async event => {
  const { id: userId } = getValidatedParams(userIdSchema, event)
  const query = await getValidatedQuery(event, i => querySchema.parse(i))
  const loginUser = await getAuthenticatedUser(event)

  const user = await getCachedUser(event, userId)
  // Handle user visibility (user must be public or logged-in as the user)
  if (!user || (!user.isPublic && user.id !== loginUser?.id))
    throw createError({ status: 404, statusText: 'Not Found' })

  // @ts-expect-error - cannot infer type properly
  const items: Omit<ScoreSearchResult, 'user'>[] =
    await db.query.scores.findMany({
      columns: {
        normalScore: true,
        exScore: true,
        maxCombo: true,
        clearLamp: true,
        rank: true,
        flareRank: true,
        flareSkill: true,
        updatedAt: true,
      },
      where: and(
        isNull(scores.deletedAt),
        isNotNull(sql`chart`),
        eq(scores.userId, user.id),
        eq(scores.songId, query.id ?? scores.songId),
        inArray(scores.playStyle, [query.style].flat()),
        inArray(scores.difficulty, [query.diff].flat()),
        inArray(scores.rank, [query.rank].flat()),
        inArray(scores.clearLamp, [query.clear].flat()),
        inArray(scores.flareRank, [query.flare].flat())
      ),
      with: {
        song: { columns: { id: true, name: true, artist: true } },
        chart: {
          columns: { level: true },
          where: inArray(charts.level, [query.lv].flat()),
        },
      },
      orderBy: [desc(scores.updatedAt)],
      offset: query.offset,
      limit: query.limit + 1, // Fetch one extra to check if there are more
    })

  const paged = buildPagenation(items, query.limit, query.offset)
  return {
    ...paged,
    items: paged.items.map(item => ({
      ...item,
      user: { id: user.id, name: user.name, area: user.area },
    })),
  } satisfies Pagenation<ScoreSearchResult>
})
