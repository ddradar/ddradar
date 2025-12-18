import { eq } from 'drizzle-orm'
import * as z from 'zod/mini'

import { ignoreTimestampCols } from '~~/server/db/utils'
import { type Song, songSchema } from '~~/shared/types/song'
import type { StepChart } from '~~/shared/types/step-chart'

/** Schema for router params */
const _paramsSchema = z.pick(songSchema, { id: true })

export const cacheName = 'getSongById'
export default cachedEventHandler(
  async event => {
    const { id } = await getValidatedRouterParams(event, _paramsSchema.parse)

    const song: (Song & { charts: StepChart[] }) | undefined =
      await db.query.songs.findFirst({
        columns: { ...ignoreTimestampCols },
        with: {
          charts: { columns: { id: false, ...ignoreTimestampCols } },
        },
        where: eq(schema.songs.id, id),
      })

    if (!song)
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    return song
  },
  {
    maxAge: 60 * 60 * 24, // 24 hours
    name: cacheName,
    getKey: event => getRouterParam(event, 'id') ?? 'undefined',
  }
)

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Get Song Details by ID',
    tags: ['Song'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: { type: 'string' },
        required: true,
        description: 'Song ID',
        example: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      },
    ],
    responses: {
      200: {
        description: 'Song details',
        content: {
          'application/json': {
            schema: {
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
                      bpm: {
                        type: 'array',
                        description: 'BPM values ([core] or [min, core, max])',
                        items: { type: 'number', minimum: 0, maximum: 9999 },
                        minItems: 1,
                        maxItems: 3,
                      },
                      level: {
                        type: 'number',
                        description: 'Level',
                        minimum: 1,
                        maximum: 20,
                      },
                      notes: {
                        type: ['integer', 'null'],
                        description: 'Normal arrow count',
                      },
                      freezes: {
                        type: ['integer', 'null'],
                        description: 'Freeze Arrow count',
                      },
                      shocks: {
                        type: ['integer', 'null'],
                        description: 'Shock Arrow count',
                      },
                      radar: {
                        type: ['object', 'null'],
                        description: 'Groove Radar data',
                        properties: {
                          stream: { type: 'number' },
                          voltage: { type: 'number' },
                          air: { type: 'number' },
                          freeze: { type: 'number' },
                          chaos: { type: 'number' },
                        },
                        required: [
                          'stream',
                          'voltage',
                          'air',
                          'freeze',
                          'chaos',
                        ],
                      },
                    },
                    required: ['playStyle', 'difficulty', 'bpm', 'level'],
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
                'charts',
              ],
            },
          },
        },
      },
      404: { description: 'Song not found' },
    },
  },
})
