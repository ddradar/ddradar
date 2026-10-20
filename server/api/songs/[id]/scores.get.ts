import { db } from '@nuxthub/db'
import { scores, users } from '@nuxthub/db/schema'
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
} from 'drizzle-orm'
import { createError, defineEventHandler, getValidatedQuery } from 'nuxt/server'
import * as z from 'zod/mini'

import { buildPagenation } from '#server/utils/pagination'
import { getValidatedParams } from '#server/utils/router'
import { songIdSchema } from '#shared/schemas/song'
import {
  Difficulty,
  PlayStyle,
  stepChartSchema,
} from '#shared/schemas/step-chart'
import { range, singleOrArray } from '#shared/utils'

/** Schema for query parameters */
const querySchema = z.compile(
  z.object({
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
 * Retrieve a paginated list of scores for the specified song.
 * Public user scores are always included; authenticated callers can also see their own private scores.
 */
export default defineEventHandler(async event => {
  const currentUser = await getAuthenticatedUser(event)
  const { id: songId } = getValidatedParams(songIdSchema, event)
  const query = await getValidatedQuery(event, i => querySchema.parse(i))

  const song = await getCachedSongInfo(event, songId)
  if (!song) throw createError({ status: 404, statusText: 'Not Found' })

  // @ts-expect-error - cannot infer type properly
  const items: Omit<ScoreSearchResult, 'song'>[] =
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
        eq(scores.songId, song.id),
        inArray(scores.playStyle, [query.style].flat()),
        inArray(scores.difficulty, [query.diff].flat()),
        isNotNull(sql`user`), // User is public or is current user
        isNull(scores.deletedAt)
      ),
      with: {
        chart: {
          columns: { playStyle: true, difficulty: true, level: true },
        },
        user: {
          columns: { id: true, name: true, area: true },
          where: or(
            eq(users.isPublic, true),
            eq(users.id, currentUser?.id ?? '')
          ),
        },
      },
      orderBy: [desc(scores.normalScore), asc(scores.updatedAt)],
      offset: query.offset,
      limit: query.limit + 1, // Fetch one extra to check if there are more
    })

  const paged = buildPagenation(items, query.limit, query.offset)
  return {
    ...paged,
    items: paged.items.map(item => ({
      ...item,
      song: { id: song.id, name: song.name, artist: song.artist },
    })),
  }
})
