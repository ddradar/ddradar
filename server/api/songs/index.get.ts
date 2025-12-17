import { and, eq, exists } from 'drizzle-orm'
import * as z from 'zod/mini'

import { ignoreTimestampCols } from '~~/server/db/utils'
import { seriesList, type Song } from '~~/shared/types/song'
import type { StepChart } from '~~/shared/types/step-chart'

/** Schema for query parameters */
const _querySchema = z.object({
  /** Song name index (0-36) */
  name: z.catch(
    z.optional(z.coerce.number().check(z.int(), z.minimum(0), z.maximum(36))),
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
      z.coerce
        .number()
        .check(z.int(), z.minimum(0), z.maximum(seriesList.length - 1))
    ),
    undefined
  ),
  /**
   * Play style (`1`: SINGLE, `2`: DOUBLE)
   * @summary Ignored if `level` is not specified.
   */
  style: z.catch(
    z.optional(z.coerce.number().check(z.int(), z.minimum(1), z.maximum(2))),
    undefined
  ),
  /**
   * Chart level (1-20)
   * @summary Ignored if `style` is not specified.
   */
  level: z.catch(
    z.optional(z.coerce.number().check(z.int(), z.minimum(1), z.maximum(20))),
    undefined
  ),
  /**
   * Whether to include charts data
   * @default false when no chart conditions (`style` and `level`) specified, true when they are specified
   */
  includeCharts: z.catch(z.coerce.boolean(), false),
})

export default eventHandler(async event => {
  const query = await getValidatedQuery(event, _querySchema.parse)

  const hasChartConditions =
    query.style !== undefined && query.level !== undefined
  const includeCharts = hasChartConditions || query.includeCharts
  const conditions = []
  if (query.name !== undefined)
    conditions.push(eq(schema.songs.nameIndex, query.name))
  if (query.series !== undefined)
    conditions.push(eq(schema.songs.series, seriesList[query.series]))
  if (hasChartConditions) {
    conditions.push(
      exists(
        db
          .select()
          .from(schema.charts)
          .where(
            and(
              eq(schema.charts.id, schema.songs.id),
              eq(schema.charts.playStyle, query.style!),
              eq(schema.charts.level, query.level!)
            )
          )
      )
    )
  }

  const res = await db.query.songs.findMany({
    columns: { ...ignoreTimestampCols },
    where: and(...conditions),
    with: {
      charts: includeCharts
        ? {
            columns: { playStyle: true, difficulty: true, level: true },
          }
        : undefined,
    },
  })
  return res.sort(compareSong) as (Song & {
    charts?: Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>[]
  })[]
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Get Song List',
    tags: ['Song'],
    parameters: [
      {
        in: 'query',
        name: 'name',
        schema: { type: 'integer', minimum: 0, maximum: 36 },
        description: 'Song name index (0-36)',
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
        schema: { type: 'integer', minimum: 0, maximum: 19 },
        description: 'Series index (0-19)',
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
        schema: { type: 'integer', minimum: 1, maximum: 2 },
        description:
          'Play style (1: SINGLE, 2: DOUBLE). Ignored if `level` is not specified.',
        examples: { SINGLE: { value: 1 }, DOUBLE: { value: 2 } },
      },
      {
        in: 'query',
        name: 'level',
        schema: { type: 'integer', minimum: 1, maximum: 20 },
        description: 'Chart level (1-20). Ignored if `style` is not specified.',
      },
      {
        in: 'query',
        name: 'includeCharts',
        schema: { type: 'boolean' },
        description:
          'Whether to include charts data. Default is false when no chart conditions (`style` and `level`) specified, true when they are specified.',
      },
    ],
    responses: {
      200: {
        description: 'List of songs',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Song ID',
                    // @ts-expect-error - pattern not provided in nitro types
                    pattern: '^[01689bdiloqDIOPQ]{32}$',
                  },
                  name: { type: 'string', description: 'Song name' },
                  nameKana: {
                    type: 'string',
                    description: 'Furigana for sorting',
                    pattern: '^[A-Z0-9 ._ぁ-んー]+$',
                  },
                  nameIndex: {
                    type: 'integer',
                    description: 'Song name index',
                    minimum: 0,
                    maximum: 36,
                  },
                  artist: { type: 'string', description: 'Artist' },
                  bpm: {
                    type: ['string', 'null'],
                    description:
                      'Displayed BPM (use DDR GRAND PRIX, A3 or earlier)',
                    pattern: '^[0-9]{1,4}(-[0-9]{1,4})?$',
                  },
                  series: {
                    type: 'string',
                    description: 'Series title',
                    enum: [
                      'DDR 1st',
                      'DDR 2ndMIX',
                      'DDR 3rdMIX',
                      'DDR 4thMIX',
                      'DDR 5thMIX',
                      'DDR MAX',
                      'DDR MAX2',
                      'DDR SuperNOVA',
                      'DDR SuperNOVA 2',
                      'DDR X',
                      'DDR X2',
                      'DDR X3 VS 2ndMIX',
                      'DDR 2013',
                      'DDR A',
                      'DDR A20',
                      'DDR A20 PLUS',
                      'DDR A3',
                      'DDR WORLD',
                    ],
                  },
                  seriesCategory: {
                    type: 'string',
                    description: 'Series category',
                    enum: ['CLASSIC', 'WHITE', 'GOLD'],
                  },
                  charts: {
                    type: 'array',
                    description: 'List of step charts (if requested)',
                    items: {
                      type: 'object',
                      properties: {
                        playStyle: {
                          type: 'integer',
                          description: 'Play style (1: Single, 2: Double)',
                          enum: [1, 2],
                        },
                        difficulty: {
                          type: 'integer',
                          description:
                            'Difficulty (0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE)',
                          enum: [0, 1, 2, 3, 4],
                        },
                        level: {
                          type: 'number',
                          description: 'Level',
                          minimum: 1,
                          maximum: 20,
                        },
                      },
                      required: ['playStyle', 'difficulty', 'level'],
                      minItems: 1,
                      maxItems: 9,
                    },
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
      },
    },
  },
})
