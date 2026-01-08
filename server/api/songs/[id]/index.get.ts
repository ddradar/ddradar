import * as z from 'zod/mini'

import { songSchema } from '#shared/schemas/song'

/** Schema for router params */
const _paramsSchema = z.pick(songSchema, { id: true })

export default defineEventHandler(async event => {
  const { id } = await getValidatedRouterParams(event, _paramsSchema.parse)

  const song = await getCachedSongInfo(event, id)
  if (!song) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  return song
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          Song: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Song ID',
                // @ts-expect-error - not provided in nitro types
                pattern: '^[01689bdiloqDIOPQ]{32}$',
              },
              name: { type: 'string', description: 'Song name' },
              nameKana: { type: 'string', description: 'Furigana for sorting' },
              nameIndex: {
                type: 'integer',
                description: 'Song name index for sorting (0-36)',
                oneOf: [
                  { type: 'integer', const: 0, description: 'あ行' },
                  { type: 'integer', const: 1, description: 'か行' },
                  { type: 'integer', const: 2, description: 'さ行' },
                  { type: 'integer', const: 3, description: 'た行' },
                  { type: 'integer', const: 4, description: 'な行' },
                  { type: 'integer', const: 5, description: 'は行' },
                  { type: 'integer', const: 6, description: 'ま行' },
                  { type: 'integer', const: 7, description: 'や行' },
                  { type: 'integer', const: 8, description: 'ら行' },
                  { type: 'integer', const: 9, description: 'わ行' },
                  { type: 'integer', const: 10, description: 'A' },
                  { type: 'integer', const: 11, description: 'B' },
                  { type: 'integer', const: 12, description: 'C' },
                  { type: 'integer', const: 13, description: 'D' },
                  { type: 'integer', const: 14, description: 'E' },
                  { type: 'integer', const: 15, description: 'F' },
                  { type: 'integer', const: 16, description: 'G' },
                  { type: 'integer', const: 17, description: 'H' },
                  { type: 'integer', const: 18, description: 'I' },
                  { type: 'integer', const: 19, description: 'J' },
                  { type: 'integer', const: 20, description: 'K' },
                  { type: 'integer', const: 21, description: 'L' },
                  { type: 'integer', const: 22, description: 'M' },
                  { type: 'integer', const: 23, description: 'N' },
                  { type: 'integer', const: 24, description: 'O' },
                  { type: 'integer', const: 25, description: 'P' },
                  { type: 'integer', const: 26, description: 'Q' },
                  { type: 'integer', const: 27, description: 'R' },
                  { type: 'integer', const: 28, description: 'S' },
                  { type: 'integer', const: 29, description: 'T' },
                  { type: 'integer', const: 30, description: 'U' },
                  { type: 'integer', const: 31, description: 'V' },
                  { type: 'integer', const: 32, description: 'W' },
                  { type: 'integer', const: 33, description: 'X' },
                  { type: 'integer', const: 34, description: 'Y' },
                  { type: 'integer', const: 35, description: 'Z' },
                  { type: 'integer', const: 36, description: '数字・記号' },
                ],
                minimum: 0,
                maximum: 36,
              },
              artist: { type: 'string', description: 'Artist' },
              bpm: {
                type: ['string', 'null'],
                description:
                  'Displayed BPM (use DDR GRAND PRIX, A3 or earlier)',
                // @ts-expect-error - not provided in nitro types
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
                items: { $ref: '#/components/schemas/StepChart' },
                minItems: 1, // At least one chart
                maxItems: 9, // Maximum 9 charts (SINGLE/DOUBLE BASIC-CHALLENGE plus SINGLE/BEGINNER)
              },
            },
            required: [
              'id',
              'name',
              'nameKana',
              'nameIndex',
              'artist',
              'series',
              'seriesCategory',
              'charts',
            ],
          },
          StepChart: {
            type: 'object',
            properties: {
              playStyle: {
                type: 'integer',
                description: 'Play style',
                oneOf: [
                  { type: 'integer', const: 1, description: 'SINGLE' },
                  { type: 'integer', const: 2, description: 'DOUBLE' },
                ],
                minimum: 1,
                maximum: 2,
              },
              difficulty: {
                type: 'integer',
                description:
                  'Difficulty (0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE)',
                oneOf: [
                  { type: 'integer', const: 0, description: 'BEGINNER' },
                  { type: 'integer', const: 1, description: 'BASIC' },
                  { type: 'integer', const: 2, description: 'DIFFICULT' },
                  { type: 'integer', const: 3, description: 'EXPERT' },
                  { type: 'integer', const: 4, description: 'CHALLENGE' },
                ],
                minimum: 0,
                maximum: 4,
              },
              // @ts-expect-error - not provided in nitro types
              bpm: {
                description: 'BPM values ([core] or [min, core, max])',
                oneOf: [
                  {
                    type: 'array',
                    items: { type: 'number', minimum: 0, maximum: 9999 },
                    minItems: 1,
                    maxItems: 1,
                  },
                  {
                    type: 'array',
                    items: { type: 'number', minimum: 0, maximum: 9999 },
                    minItems: 3,
                    maxItems: 3,
                  },
                ],
              },
              level: {
                type: 'integer',
                description: 'Level',
                minimum: 1,
                maximum: 20,
              },
              notes: {
                type: ['integer', 'null'],
                description: 'Normal arrow count',
                minimum: 1,
              },
              freezes: {
                type: ['integer', 'null'],
                description: 'Freeze Arrow count',
                minimum: 0,
              },
              shocks: {
                type: ['integer', 'null'],
                description: 'Shock Arrow count',
                minimum: 0,
              },
              radar: {
                type: ['object', 'null'],
                description: 'Groove Radar data',
                properties: {
                  stream: { type: 'integer', minimum: 0 },
                  voltage: { type: 'integer', minimum: 0 },
                  air: { type: 'integer', minimum: 0 },
                  freeze: { type: 'integer', minimum: 0 },
                  chaos: { type: 'integer', minimum: 0 },
                },
                required: ['stream', 'voltage', 'air', 'freeze', 'chaos'],
              },
            },
            required: ['playStyle', 'difficulty', 'bpm', 'level'],
          },
        },
      },
    },
    summary: 'Get Song Details by ID',
    tags: ['Song'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/Song/properties/id' },
        required: true,
        description: 'Song ID',
        example: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      },
    ],
    responses: {
      200: {
        description: 'Song details',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Song' } },
        },
      },
      400: {
        $ref: '#/components/responses/Error',
        description: 'Song ID is invalid',
      },
      404: {
        $ref: '#/components/responses/Error',
        description: 'Song not found',
      },
    },
  },
})
