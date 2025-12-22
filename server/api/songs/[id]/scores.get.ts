import { asc, desc, type Operators, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

import type { ScoreRecordInput } from '~~/shared/types/score'
import { songSchema } from '~~/shared/types/song'
import {
  Difficulty,
  PlayStyle,
  type StepChart,
  stepChartSchema,
} from '~~/shared/types/step-chart'
import type { User } from '~~/shared/types/user'
import { range } from '~~/shared/utils/types'

/** Schema for router params */
const _paramsSchema = z.pick(songSchema, { id: true })

function singleOrArray<T extends z.ZodMiniType>(schema: T) {
  return z.union([schema, z.array(schema)])
}

const _querySchema = z.object({
  style: z.catch(
    singleOrArray(
      z.coerce
        .number<StepChart['playStyle']>()
        .check(
          z.refine(i => stepChartSchema.shape.playStyle.safeParse(i).success)
        )
    ),
    [PlayStyle.SINGLE, PlayStyle.DOUBLE]
  ),
  diff: z.catch(
    singleOrArray(
      z.coerce
        .number<StepChart['difficulty']>()
        .check(
          z.refine(i => stepChartSchema.shape.difficulty.safeParse(i).success)
        )
    ),
    range(Difficulty.BEGINNER, Difficulty.CHALLENGE)
  ),
  limit: z.catch(
    z.coerce.number().check(z.int(), z.positive(), z.maximum(100)),
    50
  ),
  offset: z.catch(z.coerce.number().check(z.int(), z.nonnegative()), 0),
})

export default defineEventHandler(async event => {
  const currentUser = await getAuthenticatedUser(event)
  const { id: songId } = await getValidatedRouterParams(
    event,
    _paramsSchema.parse
  )
  const query = await getValidatedQuery(event, _querySchema.parse)

  // @ts-expect-error - cannot infer type properly
  const items: (ScoreRecordInput & {
    song: Pick<Song, 'name' | 'artist'>
    chart: Pick<StepChart, 'level'>
    user: Pick<User, 'name' | 'area'>
    updatedAt: Date
  })[] = await db.query.scores.findMany({
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
        isNull(scores.deletedAt),
        eq(scores.songId, songId),
        inArray(scores.playStyle, [query.style].flat()),
        inArray(scores.difficulty, [query.diff].flat()),
        isNotNull(sql`user`)
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
})
