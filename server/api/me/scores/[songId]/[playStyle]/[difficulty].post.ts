import { db } from '@nuxthub/db'
import { scores } from '@nuxthub/db/schema'
import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'
import * as z from 'zod/mini'

import { getValidatedParams } from '#server/utils/router'
import { getReason } from '#server/utils/score-insert'
import { scoreRecordKeySchema, scoreRecordSchema } from '#shared/schemas/score'
import { chartEquals } from '#shared/schemas/step-chart'
import { ValidateScoreRecord } from '#shared/utils/score'

/** Schema for router params */
const paramsSchema = z.compile(z.omit(scoreRecordKeySchema, { userId: true }))

/**
 * Creates or updates the score record for the authenticated user corresponding to the specified song ID, play style, and difficulty.
 */
export default defineEventHandler(async event => {
  // Get & Validate user inputs
  const { id: userId } = await requireAuthenticatedUser(event)
  const params = getValidatedParams(paramsSchema, event)
  const body = await readValidatedBody(event, i => scoreRecordSchema.parse(i))

  // Get song and chart info
  const song = await getCachedSongInfo(event, params.songId)
  const chart = song?.charts.find(c => chartEquals(c, params))
  if (!chart) throw createError({ status: 404, statusText: 'Not Found' })

  // Validate score data
  const validationErrors = ValidateScoreRecord(chart, body)
  if (validationErrors.length > 0) {
    throw createError({
      status: 400,
      statusText: 'Bad Request',
      message: 'Score validation failed.',
      data: getReason('VALIDATION_FAILED', 0, body, undefined, {
        fields: validationErrors,
      }),
    })
  }

  // Upsert score record
  const row = { ...params, userId, ...body, updatedBy: userId, deletedAt: null }
  const [saved] = await db
    .insert(scores)
    .values({ ...row, createdBy: userId })
    .onConflictDoUpdate({
      target: [
        scores.songId,
        scores.playStyle,
        scores.difficulty,
        scores.userId,
      ],
      set: row,
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
