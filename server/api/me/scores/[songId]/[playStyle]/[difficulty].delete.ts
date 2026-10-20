import type { D1Response } from '@cloudflare/workers-types'
import { db } from '@nuxthub/db'
import { scores } from '@nuxthub/db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { createError, defineEventHandler, setResponseStatus } from 'nuxt/server'
import * as z from 'zod/mini'

import { getValidatedParams } from '#server/utils/router'
import { scoreRecordKeySchema } from '#shared/schemas/score'

/** Schema for router params */
const paramsSchema = z.compile(z.omit(scoreRecordKeySchema, { userId: true }))

/**
 * Deletes the score record for the authenticated user corresponding to the specified song ID, play style, and difficulty.
 */
export default defineEventHandler(async event => {
  const { id: userId } = await requireAuthenticatedUser(event)
  const params = getValidatedParams(paramsSchema, event)

  const result = (await db
    .update(scores)
    .set({ deletedAt: new Date(), updatedAt: new Date(), updatedBy: userId })
    .where(
      and(
        eq(scores.userId, userId),
        eq(scores.songId, params.songId),
        eq(scores.playStyle, params.playStyle),
        eq(scores.difficulty, params.difficulty),
        isNull(scores.deletedAt)
      )
    )
    .run()) as D1Response

  if (!result.meta.changes)
    throw createError({ status: 404, statusText: 'Not Found' })
  setResponseStatus(event, 204)
})
