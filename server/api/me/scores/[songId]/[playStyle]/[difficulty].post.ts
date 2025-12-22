import * as z from 'zod/mini'

import { getStepChart } from '~~/server/db/utils'
import { scoreRecordKeySchema, scoreRecordSchema } from '~~/shared/types/score'
import { ValidateScoreRecord } from '~~/shared/utils/score'

/** Schema for router params */
const _paramsSchema = z.omit(scoreRecordKeySchema, { userId: true })

export default defineEventHandler(async event => {
  // Get & Validate user inputs
  const { id: userId } = await requireAuthenticatedUser(event)
  const params = await getValidatedRouterParams(event, _paramsSchema.parse)
  const body = await readValidatedBody(event, scoreRecordSchema.parse)

  // Validate chart existence and score data
  const chart = await getStepChart(params)
  if (!chart) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
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
    .insert(schema.scores)
    .values(row)
    .onConflictDoUpdate({
      target: [
        schema.scores.songId,
        schema.scores.playStyle,
        schema.scores.difficulty,
        schema.scores.userId,
      ],
      set: { ...row, updatedAt: new Date() },
    })
    .returning({
      normalScore: schema.scores.normalScore,
      exScore: schema.scores.exScore,
      maxCombo: schema.scores.maxCombo,
      clearLamp: schema.scores.clearLamp,
      rank: schema.scores.rank,
      flareRank: schema.scores.flareRank,
      flareSkill: schema.scores.flareSkill,
    })
  return saved
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Create or update the score record for the specified song',
    description:
      'Creates or updates the score record for the authenticated user corresponding to the specified song ID, play style, and difficulty.',
    tags: ['Score'],
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
        description: 'Invalid input data',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      404: {
        description:
          'Step chart not found for the specified song ID, play style, and difficulty',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
})
