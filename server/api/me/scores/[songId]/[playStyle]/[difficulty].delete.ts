import { and, eq, isNull } from 'drizzle-orm'
import * as z from 'zod/mini'

import { scoreRecordKeySchema } from '~~/shared/types/score'

/** Schema for router params */
const _paramsSchema = z.omit(scoreRecordKeySchema, { userId: true })

export default defineEventHandler(async event => {
  const { id: userId } = await requireAuthenticatedUser(event)
  const params = await getValidatedRouterParams(event, _paramsSchema.parse)

  const result = await db
    .update(schema.scores)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(schema.scores.userId, userId),
        eq(schema.scores.songId, params.songId),
        eq(schema.scores.playStyle, params.playStyle),
        eq(schema.scores.difficulty, params.difficulty),
        isNull(schema.scores.deletedAt)
      )
    )
    .run()

  if (!result.changes)
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  setResponseStatus(event, 204)
})

// Define OpenAPI metadata
defineRouteMeta({
  openAPI: {
    summary: 'Delete the specified score record',
    description:
      'Deletes the score record for the authenticated user corresponding to the specified song ID, play style, and difficulty.',
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
        examples: {
          SINGLE: { value: 1, description: 'Single Play' },
          DOUBLE: { value: 2, description: 'Double Play' },
        },
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
    responses: {
      204: {
        description: 'Score record deleted successfully.',
      },
      404: {
        description: 'Score record not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
})
