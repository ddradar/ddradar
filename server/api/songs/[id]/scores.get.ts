import { asc, desc, type Operators, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

import { songSchema } from '#shared/schemas/song'
import {
  Difficulty,
  PlayStyle,
  stepChartSchema,
} from '#shared/schemas/step-chart'
import { range } from '#shared/utils'

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

    const song = await getCachedSongInfo(event, songId)
    if (!song)
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })

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
        where: (scores, { and, eq, inArray, isNull, isNotNull }) =>
          and(
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
            where: (users: typeof schema.users, { eq, or }: Operators) =>
              or(eq(users.isPublic, true), eq(users.id, currentUser?.id ?? '')),
          },
        },
        orderBy: [
          desc(schema.scores.normalScore),
          asc(schema.scores.updatedAt),
        ],
        offset: query.offset,
        limit: query.limit + 1, // Fetch one extra to check if there are more
      })

    const hasMore = items.length > query.limit
    const result = items.slice(0, query.limit).map(item => ({
      ...item,
      song: { id: song.id, name: song.name, artist: song.artist },
    }))

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
    $global: {
      components: {
        schemas: {
          PaginatedResult: {
            type: 'object',
            description:
              'Paginated items search result (add items property via allOf)',
            properties: {
              limit: {
                type: 'integer',
                description: 'Maximum number of items returned per page',
                minimum: 1,
                maximum: 100,
              },
              offset: {
                type: 'integer',
                description: 'Current offset applied to the query',
                minimum: 0,
              },
              nextOffset: {
                type: ['integer', 'null'],
                description:
                  'Offset for the next page (null when no additional pages)',
              },
              hasMore: {
                type: 'boolean',
                description: 'Whether additional pages are available',
              },
            },
            required: ['limit', 'offset', 'nextOffset', 'hasMore'],
          },
          ScoreSearchItem: {
            type: 'object',
            description:
              'Score record with related song, chart, and user summary information.',
            allOf: [
              {
                type: 'object',
                properties: {
                  song: {
                    type: 'object',
                    description: 'Related song summary',
                    properties: {
                      id: { $ref: '#/components/schemas/Song/properties/id' },
                      name: {
                        $ref: '#/components/schemas/Song/properties/name',
                      },
                      artist: {
                        $ref: '#/components/schemas/Song/properties/artist',
                      },
                    },
                    required: ['id', 'name', 'artist'],
                  },
                  chart: {
                    type: 'object',
                    description: 'Related chart summary',
                    properties: {
                      playStyle: {
                        $ref: '#/components/schemas/StepChart/properties/playStyle',
                      },
                      difficulty: {
                        $ref: '#/components/schemas/StepChart/properties/difficulty',
                      },
                      level: {
                        $ref: '#/components/schemas/StepChart/properties/level',
                      },
                    },
                    required: ['playStyle', 'difficulty', 'level'],
                  },
                  user: {
                    type: 'object',
                    description: 'Score owner summary',
                    properties: {
                      id: { $ref: '#/components/schemas/User/properties/id' },
                      name: {
                        $ref: '#/components/schemas/User/properties/name',
                      },
                      area: {
                        $ref: '#/components/schemas/User/properties/area',
                      },
                    },
                    required: ['id', 'name', 'area'],
                  },
                  updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Last update time for this score',
                  },
                },
              },
              { $ref: '#/components/schemas/ScoreRecord' },
            ],
          },
        },
      },
    },
    summary: 'Get Scores for a Song',
    description:
      'Retrieve a paginated list of scores for the specified song. Public user scores are always included; authenticated callers can also see their own private scores.',
    tags: ['Score'],
    security: [{ SessionCookieAuth: [] }, { BearerAuth: [] }, {}],
    parameters: [
      {
        in: 'path',
        name: 'id',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/Song/properties/id' },
        required: true,
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
        name: 'limit',
        schema: {
          // @ts-expect-error - not provided in nitro types
          $ref: '#/components/schemas/PaginatedResult/properties/limit',
          default: 50,
        },
        description: 'Maximum number of items to return (default: 50)',
      },
      {
        in: 'query',
        name: 'offset',
        schema: {
          // @ts-expect-error - not provided in nitro types
          $ref: '#/components/schemas/PaginatedResult/properties/offset',
          default: 0,
        },
        description: 'Number of items to skip (default: 0)',
      },
    ],
    responses: {
      200: {
        description: 'Paginated list of song scores',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Paginated list of song scores',
              allOf: [
                {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      description: 'Array of score records',
                      items: { $ref: '#/components/schemas/ScoreSearchItem' },
                    },
                  },
                },
                { $ref: '#/components/schemas/PaginatedResult' },
              ],
            },
          },
        },
      },
      400: {
        $ref: '#/components/responses/Error',
        description: 'Bad Request - Invalid parameters',
      },
    },
  },
})
