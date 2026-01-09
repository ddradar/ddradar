import { scores } from 'hub:db:schema'
import * as z from 'zod/mini'

import { scoreRecordKeySchema, scoreRecordSchema } from '#shared/schemas/score'
import { chartEquals } from '#shared/schemas/step-chart'
import { ValidateScoreRecord } from '#shared/utils/score'
import { getReason } from '~~/server/utils/score-insert'

/** Schema for router params */
const _paramsSchema = z.omit(scoreRecordKeySchema, { userId: true })

export default defineEventHandler(async event => {
  // Get & Validate user inputs
  const { id: userId } = await requireAuthenticatedUser(event)
  const params = await getValidatedRouterParams(event, _paramsSchema.parse)
  const body = await readValidatedBody(event, scoreRecordSchema.parse)

  // Get song and chart info
  const song = await getCachedSongInfo(event, params.songId)
  if (!song) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  const chart = song.charts.find(c => chartEquals(c, params))
  if (!chart) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  // Validate score data
  const validationErrors = ValidateScoreRecord(chart, body)
  if (validationErrors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Score validation failed.',
      data: getReason('VALIDATION_FAILED', 0, body, undefined, {
        fields: validationErrors,
      }),
    })
  }

  // Upsert score record
  const row = { ...params, userId, ...body, deletedAt: null }
  const [saved] = await db
    .insert(scores)
    .values(row)
    .onConflictDoUpdate({
      target: [
        scores.songId,
        scores.playStyle,
        scores.difficulty,
        scores.userId,
      ],
      set: { ...row, updatedAt: new Date() },
    })
    .returning({
      normalScore: scores.normalScore,
      exScore: scores.exScore,
      maxCombo: scores.maxCombo,
      clearLamp: scores.clearLamp,
      rank: scores.rank,
      flareRank: scores.flareRank,
      flareSkill: scores.flareSkill,
    })
  return saved
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          ScoreRecord: {
            type: 'object',
            properties: {
              normalScore: {
                type: 'integer',
                description: 'Normal Score (0-1,000,000)',
                minimum: 0,
                maximum: 1000000,
              },
              exScore: {
                type: ['integer', 'null'],
                description: 'EX Score',
                minimum: 0,
              },
              maxCombo: {
                type: ['integer', 'null'],
                description: 'Max Combo',
                minimum: 0,
              },
              clearLamp: {
                type: 'integer',
                description: 'Clear Lamp',
                oneOf: [
                  { type: 'integer', const: 0, description: 'Failed' },
                  { type: 'integer', const: 1, description: 'Assisted Clear' },
                  { type: 'integer', const: 2, description: 'Clear' },
                  { type: 'integer', const: 3, description: 'Life 4 Clear' },
                  {
                    type: 'integer',
                    const: 4,
                    description: 'Full Combo (Good FC)',
                  },
                  {
                    type: 'integer',
                    const: 5,
                    description: 'Great Full Combo',
                  },
                  {
                    type: 'integer',
                    const: 6,
                    description: 'Perfect Full Combo',
                  },
                  {
                    type: 'integer',
                    const: 7,
                    description: 'Marvelous Full Combo',
                  },
                ],
              },
              rank: {
                type: 'string',
                description: 'Dance Level',
                enum: [
                  'AAA',
                  'AA+',
                  'AA',
                  'AA-',
                  'A+',
                  'A',
                  'A-',
                  'B+',
                  'B',
                  'B-',
                  'C+',
                  'C',
                  'C-',
                  'D+',
                  'D',
                  'E',
                ],
              },
              flareRank: {
                type: 'integer',
                description: 'Flare Rank',
                oneOf: [
                  { type: 'integer', const: 0, description: 'No FLARE' },
                  { type: 'integer', const: 1, description: 'FLARE I' },
                  { type: 'integer', const: 2, description: 'FLARE II' },
                  { type: 'integer', const: 3, description: 'FLARE III' },
                  { type: 'integer', const: 4, description: 'FLARE IV' },
                  { type: 'integer', const: 5, description: 'FLARE V' },
                  { type: 'integer', const: 6, description: 'FLARE VI' },
                  { type: 'integer', const: 7, description: 'FLARE VII' },
                  { type: 'integer', const: 8, description: 'FLARE VIII' },
                  { type: 'integer', const: 9, description: 'FLARE IX' },
                  { type: 'integer', const: 10, description: 'FLARE EX' },
                ],
              },
              flareSkill: {
                type: ['integer', 'null'],
                description: 'Flare Skill',
                minimum: 0,
                maximum: 1064, // Level 19, Flare EX
              },
            },
            required: ['normalScore', 'clearLamp', 'rank', 'flareRank'],
          },
        },
      },
    },
    summary: 'Create or update the score record for the specified song',
    description:
      'Creates or updates the score record for the authenticated user corresponding to the specified song ID, play style, and difficulty.',
    tags: ['Score'],
    security: [{ SessionCookieAuth: [] }, { BearerAuth: [] }],
    parameters: [
      {
        in: 'path',
        name: 'songId',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/Song/properties/id' },
        required: true,
        description: 'Song ID',
      },
      {
        in: 'path',
        name: 'playStyle',
        // @ts-expect-error - not provided in nitro types
        schema: { $ref: '#/components/schemas/StepChart/properties/playStyle' },
        required: true,
        description: 'Play Style (1: Single, 2: Double)',
      },
      {
        in: 'path',
        name: 'difficulty',
        schema: {
          // @ts-expect-error - not provided in nitro types
          $ref: '#/components/schemas/StepChart/properties/difficulty',
        },
        required: true,
        description:
          'Difficulty (0: Beginner, 1: Basic, 2: Difficult, 3: Expert, 4: Challenge)',
      },
    ],
    requestBody: {
      description: 'Score record data to be created or updated',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ScoreRecord' },
        },
      },
    },
    responses: {
      200: {
        description: 'The created or updated score record',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ScoreRecord' },
          },
        },
      },
      400: {
        $ref: '#/components/responses/Error',
        description: 'Invalid input data',
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: { $ref: '#/components/responses/RegistrationRequired' },
      404: {
        $ref: '#/components/responses/Error',
        description:
          'Step chart not found for the specified song ID, play style, and difficulty',
      },
    },
  },
})
