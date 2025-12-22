import { desc, type Operators, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

import {
  ClearLamp,
  danceLevels,
  FlareRank,
  scoreRecordSchema,
} from '~~/shared/schemas/score'
import { songSchema } from '~~/shared/schemas/song'
import {
  Difficulty,
  PlayStyle,
  stepChartSchema,
} from '~~/shared/schemas/step-chart'
import { userSchema } from '~~/shared/schemas/user'
import { range } from '~~/shared/utils'

/** Schema for router params */
const _paramsSchema = z.pick(userSchema, { id: true })

const _querySchema = z.object({
  /** Song ID */
  id: z.optional(songSchema.shape.id),
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
  /** Level (default: all levels) */
  lv: z.catch(
    singleOrArray(
      z.coerce
        .number()
        .check(z.refine(i => stepChartSchema.shape.level.safeParse(i).success))
    ),
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
      z.coerce
        .number()
        .check(
          z.refine(i => scoreRecordSchema.shape.clearLamp.safeParse(i).success)
        )
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
      z.coerce
        .number()
        .check(
          z.refine(i => scoreRecordSchema.shape.flareRank.safeParse(i).success)
        )
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

export default defineEventHandler(
  async (event): Promise<Pagenation<ScoreSearchResult>> => {
    const currentUser = await getAuthenticatedUser(event)
    const { id: userId } = await getValidatedRouterParams(
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
          eq(scores.userId, userId),
          isNull(scores.deletedAt),
          eq(scores.songId, query.id ?? scores.songId),
          inArray(scores.playStyle, [query.style].flat()),
          inArray(scores.difficulty, [query.diff].flat()),
          inArray(scores.rank, [query.rank].flat()),
          inArray(scores.clearLamp, [query.clear].flat()),
          inArray(scores.flareRank, [query.flare].flat()),
          isNotNull(sql`chart`),
          isNotNull(sql`user`)
        ),
      with: {
        song: { columns: { name: true, artist: true } },
        chart: {
          columns: { level: true },
          where: (charts: typeof schema.charts, { inArray }: Operators) =>
            inArray(charts.level, [query.lv].flat()),
        },
        user: {
          columns: { name: true, area: true },
          where: (users: typeof schema.users, { eq, or }: Operators) =>
            or(eq(users.isPublic, true), eq(users.id, currentUser?.id ?? '')),
        },
      },
      orderBy: [desc(schema.scores.updatedAt)],
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

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Get User Scores',
    description:
      'Retrieve a paginated list of scores for a specific user. Only public profiles are accessible unless the requester is the user themselves. Supports filtering by song, play style, difficulty, level, clear lamp, flare rank, and dance rank.',
    tags: ['Score'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/User/properties/id' },
        required: true,
        description: 'User ID',
      },
      {
        in: 'query',
        name: 'id',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/Song/properties/id' },
        description: 'Song ID',
      },
      {
        in: 'query',
        name: 'style',
        required: false,
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/StepChart/properties/playStyle',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description: 'Play style (1: SINGLE, 2: DOUBLE) default: both',
      },
      {
        in: 'query',
        name: 'diff',
        required: false,
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/StepChart/properties/difficulty',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description:
          'Difficulty (0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE) default: all',
      },
      {
        in: 'query',
        name: 'lv',
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/StepChart/properties/level',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description: 'Level (1-20) default: all',
      },
      {
        in: 'query',
        name: 'clear',
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ScoreRecord/properties/clearLamp',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description:
          'Clear Lamp (0: Failed, 1: Assisted Clear, 2: Clear, 3: Life 4, 4: Full Combo, 5: Great Full Combo, 6: Perfect Full Combo, 7: Marvelous Full Combo) default: all',
      },
      {
        in: 'query',
        name: 'flare',
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ScoreRecord/properties/flareRank',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description: 'Flare Rank (0-10: No FLARE to FLARE EX) default: all',
      },
      {
        in: 'query',
        name: 'rank',
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ScoreRecord/properties/rank',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description: 'Dance Level (AAA-E) default: all',
      },
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
        description: 'Maximum number of items to return (default: 50)',
      },
      {
        in: 'query',
        name: 'offset',
        schema: { type: 'integer', minimum: 0, default: 0 },
        description: 'Number of items to skip (default: 0)',
      },
    ],
    responses: {
      200: {
        description: 'Paginated list of user scores',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      songId: {
                        $ref: '#/components/schemas/Song/properties/id',
                      },
                      playStyle: {
                        $ref: '#/components/schemas/StepChart/properties/playStyle',
                      },
                      difficulty: {
                        $ref: '#/components/schemas/StepChart/properties/difficulty',
                      },
                      normalScore: {
                        $ref: '#/components/schemas/ScoreRecord/properties/normalScore',
                      },
                      exScore: {
                        $ref: '#/components/schemas/ScoreRecord/properties/exScore',
                      },
                      maxCombo: {
                        $ref: '#/components/schemas/ScoreRecord/properties/maxCombo',
                      },
                      clearLamp: {
                        $ref: '#/components/schemas/ScoreRecord/properties/clearLamp',
                      },
                      rank: {
                        $ref: '#/components/schemas/ScoreRecord/properties/rank',
                      },
                      flareRank: {
                        $ref: '#/components/schemas/ScoreRecord/properties/flareRank',
                      },
                      flareSkill: {
                        $ref: '#/components/schemas/ScoreRecord/properties/flareSkill',
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last update time',
                      },
                    },
                    required: [
                      'songId',
                      'playStyle',
                      'difficulty',
                      'normalScore',
                      'clearLamp',
                      'rank',
                      'flareRank',
                      'updatedAt',
                    ],
                  },
                },
                limit: {
                  type: 'integer',
                  description: 'Number of items per page',
                },
                offset: {
                  type: 'integer',
                  description: 'Current offset',
                },
                nextOffset: {
                  type: ['integer', 'null'],
                  description:
                    'Next offset for pagination (null if no more items)',
                },
                hasMore: {
                  type: 'boolean',
                  description: 'Whether there are more items available',
                },
              },
              required: ['items', 'limit', 'offset', 'nextOffset', 'hasMore'],
            },
          },
        },
      },
      404: {
        description: 'User not found or not accessible',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
})
