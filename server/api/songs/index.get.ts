import { db } from '@nuxthub/db'
import { charts, songs } from '@nuxthub/db/schema'
import { and, asc, eq, exists, inArray, isNull } from 'drizzle-orm'
import * as z from 'zod/mini'

import { NameIndex, seriesList } from '#shared/schemas/song'
import { stepChartSchema } from '#shared/schemas/step-chart'
import { singleOrArray } from '#shared/utils'
import { ignoreTimestampCols } from '~~/server/db/utils'
import { buildPagenation } from '~~/server/utils/pagination'

/** Schema for query parameters */
const _querySchema = z.object({
  /** Song name index (0-36) */
  name: z.catch(
    z.optional(
      singleOrArray(
        z.coerce
          .number()
          .check(
            z.refine(i => (Object.values(NameIndex) as number[]).includes(i))
          )
      )
    ),
    undefined
  ),
  /**
   * Series index
   * @description
   * - 0: DDR 1st
   * - 1: DDR 2ndMIX
   * - ...
   * - 18: DDR A3
   * - 19: DDR WORLD
   */
  series: z.catch(
    z.optional(
      singleOrArray(
        z.coerce.number().check(z.refine(i => i >= 0 && i < seriesList.length))
      )
    ),
    undefined
  ),
  /** Play style (`1`: SINGLE, `2`: DOUBLE) */
  style: z.catch(
    z.optional(
      z.coerce
        .number()
        .check(
          z.refine(i => stepChartSchema.shape.playStyle.safeParse(i).success)
        )
    ),
    undefined
  ),
  /** Chart level (1-20) */
  level: z.catch(
    z.optional(
      singleOrArray(
        z.coerce
          .number()
          .check(
            z.refine(i => stepChartSchema.shape.level.safeParse(i).success)
          )
      )
    ),
    undefined
  ),
  /**
   * Whether to include charts data
   * @default false when no chart conditions (`style` and `level`) specified, true when they are specified
   */
  includeCharts: z.catch(z.stringbool(), false),
  /** Maximum number of items to return (default: 50, maximum: 100) */
  limit: z.catch(
    z.coerce.number().check(z.int(), z.positive(), z.maximum(100)),
    50
  ),
  /** Number of items to skip. use for pagination (default: 0) */
  offset: z.catch(z.coerce.number().check(z.int(), z.nonnegative()), 0),
})

/** Cache name for "GET /api/songs" handler */
export const cacheName = 'getSongList'

export default cachedEventHandler(
  async event => {
    const query = await getValidatedQuery(event, _querySchema.parse)

    const hasChartConditions =
      query.style !== undefined || query.level !== undefined
    const includeCharts = hasChartConditions || query.includeCharts

    // Build query conditions
    const conditions = [isNull(songs.deletedAt)]
    if (query.name !== undefined)
      conditions.push(inArray(songs.nameIndex, [query.name].flat()))
    if (query.series !== undefined)
      conditions.push(
        inArray(
          songs.series,
          [query.series].flat().map(i => seriesList[i]!)
        )
      )
    if (hasChartConditions) {
      const chartConditions = [
        eq(charts.id, songs.id),
        isNull(charts.deletedAt),
      ]
      if (query.style !== undefined)
        chartConditions.push(eq(charts.playStyle, query.style))
      if (query.level !== undefined)
        chartConditions.push(inArray(charts.level, [query.level].flat()))
      conditions.push(
        exists(
          db
            .select()
            .from(charts)
            .where(and(...chartConditions))
        )
      )
    }

    const items: SongSearchResult[] = await db.query.songs.findMany({
      columns: { ...ignoreTimestampCols },
      where: and(...conditions),
      with: {
        charts: includeCharts
          ? {
              columns: { playStyle: true, difficulty: true, level: true },
              where: (charts, { isNull }) => isNull(charts.deletedAt),
            }
          : undefined,
      },
      orderBy: [asc(songs.nameIndex), asc(songs.nameKana)],
      offset: query.offset,
      limit: query.limit + 1,
    })

    return buildPagenation(items, query.limit, query.offset)
  },
  {
    maxAge: 60 * 60, // 1 hour
    name: cacheName,
    getKey: async event => {
      const query = await getValidatedQuery(event, _querySchema.parse)
      const hasChartConditions =
        query.style !== undefined || query.level !== undefined
      const withCharts = hasChartConditions || query.includeCharts

      const params: string[] = []
      if (query.name !== undefined)
        params.push(`name=${[query.name].flat().sort().join(',')}`)
      if (query.series !== undefined)
        params.push(`series=${[query.series].flat().sort().join(',')}`)
      if (query.style !== undefined) params.push(`style=${query.style}`)
      if (query.level !== undefined)
        params.push(`level=${[query.level].flat().sort().join(',')}`)
      if (query.offset > 0) params.push(`offset=${query.offset}`)
      if (query.limit !== 50) params.push(`limit=${query.limit}`)
      params.sort()
      const queryString = params.join('&') || 'all'
      return `${withCharts ? 'withCharts:' : ''}${queryString}`
    },
  }
)

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Get Song List',
    tags: ['Song'],
    parameters: [
      {
        in: 'query',
        name: 'name',
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Song/properties/nameIndex',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description: 'Song name index (0-36)',
        required: false,
        examples: {
          あ行: { value: 0 },
          か行: { value: 1 },
          さ行: { value: 2 },
          た行: { value: 3 },
          な行: { value: 4 },
          は行: { value: 5 },
          ま行: { value: 6 },
          や行: { value: 7 },
          ら行: { value: 8 },
          わ行: { value: 9 },
          A: { value: 10 },
          B: { value: 11 },
          C: { value: 12 },
          D: { value: 13 },
          E: { value: 14 },
          F: { value: 15 },
          G: { value: 16 },
          H: { value: 17 },
          I: { value: 18 },
          J: { value: 19 },
          K: { value: 20 },
          L: { value: 21 },
          M: { value: 22 },
          N: { value: 23 },
          O: { value: 24 },
          P: { value: 25 },
          Q: { value: 26 },
          R: { value: 27 },
          S: { value: 28 },
          T: { value: 29 },
          U: { value: 30 },
          V: { value: 31 },
          W: { value: 32 },
          X: { value: 33 },
          Y: { value: 34 },
          Z: { value: 35 },
          '数字・記号': { value: 36 },
        },
      },
      {
        in: 'query',
        name: 'series',
        schema: {
          type: 'array',
          items: { type: 'integer', minimum: 0, maximum: 19 },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description: 'Series index (0-19)',
        required: false,
        examples: {
          'DDR 1st': { value: 0 },
          'DDR 2ndMIX': { value: 1 },
          'DDR 3rdMIX': { value: 2 },
          'DDR 4thMIX': { value: 3 },
          'DDR 5thMIX': { value: 4 },
          DDRMAX: { value: 5 },
          DDRMAX2: { value: 6 },
          'DDR EXTREME': { value: 7 },
          'DDR SuperNOVA': { value: 8 },
          'DDR SuperNOVA2': { value: 9 },
          'DDR X': { value: 10 },
          'DDR X2': { value: 11 },
          'DDR X3 VS 2ndMIX': { value: 12 },
          'DDR (2013)': { value: 13 },
          'DDR (2014)': { value: 14 },
          'DDR A': { value: 15 },
          'DDR A20': { value: 16 },
          'DDR A20 PLUS': { value: 17 },
          'DDR A3': { value: 18 },
          'DDR WORLD': { value: 19 },
        },
      },
      {
        in: 'query',
        name: 'style',
        required: false,
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/StepChart/properties/playStyle' },
        description: 'Play style (1: SINGLE, 2: DOUBLE).',
        examples: { SINGLE: { value: 1 }, DOUBLE: { value: 2 } },
      },
      {
        in: 'query',
        name: 'level',
        required: false,
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/StepChart/properties/level',
          },
          // @ts-expect-error - not provided in nitro types
          style: 'form',
          explode: true,
        },
        description: 'Chart level (1-20).',
      },
      {
        in: 'query',
        name: 'includeCharts',
        schema: { type: 'boolean' },
        description:
          'Whether to include charts data. Default is false when no chart conditions (`style` and `level`) specified, true when they are specified.',
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
        description: 'Paginated list of songs',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Paginated list of songs',
              allOf: [
                {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      description: 'Array of songs',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            $ref: '#/components/schemas/Song/properties/id',
                          },
                          name: {
                            $ref: '#/components/schemas/Song/properties/name',
                          },
                          nameKana: {
                            $ref: '#/components/schemas/Song/properties/nameKana',
                          },
                          nameIndex: {
                            $ref: '#/components/schemas/Song/properties/nameIndex',
                          },
                          artist: {
                            $ref: '#/components/schemas/Song/properties/artist',
                          },
                          bpm: {
                            $ref: '#/components/schemas/Song/properties/bpm',
                          },
                          series: {
                            $ref: '#/components/schemas/Song/properties/series',
                          },
                          seriesCategory: {
                            $ref: '#/components/schemas/Song/properties/seriesCategory',
                          },
                          charts: {
                            type: 'array',
                            description: 'List of step charts (if requested)',
                            items: {
                              type: 'object',
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
                            minItems: 1,
                            maxItems: 9,
                          },
                        },
                        required: [
                          'id',
                          'name',
                          'nameKana',
                          'nameIndex',
                          'artist',
                          'bpm',
                          'series',
                          'seriesCategory',
                        ],
                      },
                    },
                  },
                },
                { $ref: '#/components/schemas/PaginatedResult' },
              ],
            },
          },
        },
      },
    },
  },
})
