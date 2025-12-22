import { asc, desc, type Operators, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

import { songSchema } from '~~/shared/schemas/song'
import {
  Difficulty,
  PlayStyle,
  stepChartSchema,
} from '~~/shared/schemas/step-chart'
import { range } from '~~/shared/utils'

/** Schema for router params */
const _paramsSchema = z.pick(songSchema, { id: true })

/** Schema for query parameters */
const _querySchema = z.object({
  /**
   * Play Style (default: all styles)
   * @description `1`: SINGLE, `2`: DOUBLE
   */
  style: z.catch(
    singleOrArray(
      z.coerce
        .number()
        .check(
          z.refine(i => stepChartSchema.shape.playStyle.safeParse(i).success)
        )
    ),
    [PlayStyle.SINGLE, PlayStyle.DOUBLE]
  ),
  /**
   * Difficulty (default: all difficulties)
   * @description `0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE
   */
  diff: z.catch(
    singleOrArray(
      z.coerce
        .number()
        .check(
          z.refine(i => stepChartSchema.shape.difficulty.safeParse(i).success)
        )
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

export default defineEventHandler(
  async (event): Promise<Pagenation<ScoreSearchResult>> => {
    const currentUser = await getAuthenticatedUser(event)
    const { id: songId } = await getValidatedRouterParams(
      event,
      _paramsSchema.parse
    )
    const query = await getValidatedQuery(event, _querySchema.parse)

    // @ts-expect-error - cannot infer type properly
    const items: ScoreSearchResult[] = await db.query.scores.findMany({
      columns: {
        songId: true,
        playStyle: true,
        difficulty: true,
        normalScore: true,
        exScore: true,
        maxCombo: true,
        clearLamp: true,
        rank: true,
        flareRank: true,
        flareSkill: true,
        updatedAt: true,
      },
      where: (scores, { and, eq, inArray, isNull, isNotNull }) =>
        and(
          eq(scores.songId, songId),
          inArray(scores.playStyle, [query.style].flat()),
          inArray(scores.difficulty, [query.diff].flat()),
          isNotNull(sql`user`), // User is public or is current user
          isNull(scores.deletedAt)
        ),
      with: {
        song: { columns: { name: true, artist: true } },
        chart: { columns: { level: true } },
        user: {
          columns: { name: true, area: true },
          where: (users: typeof schema.users, { eq, or }: Operators) =>
            or(eq(users.isPublic, true), eq(users.id, currentUser?.id ?? '')),
        },
      },
      orderBy: [desc(schema.scores.normalScore), asc(schema.scores.updatedAt)],
      offset: query.offset,
      limit: query.limit + 1, // Fetch one extra to check if there are more
    })

    const hasMore = items.length > query.limit
    const result = items.slice(0, query.limit)

    return {
      items: result,
      limit: query.limit,
      offset: query.offset,
      nextOffset: hasMore ? query.offset + query.limit : null,
      hasMore,
    }
  }
)
