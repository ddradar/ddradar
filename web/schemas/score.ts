import type { ScoreSchema } from '@ddradar/core'
import { score, scoreSchema } from '@ddradar/core'
import { z } from 'zod'

/** GET/POST/DELETE `api/v1/scores/[id]/[style]/[diff]` expected router params */
export const routerParamsSchema = z.object({
  id: scoreSchema.shape.songId,
  style: z.coerce.number().pipe(scoreSchema.shape.playStyle),
  diff: z.coerce.number().pipe(scoreSchema.shape.difficulty),
})

/** GET `api/v1/scores/[id]/[style]/[diff]` expected query */
export const getQuerySchema = z.object({
  scope: z
    .union([z.literal('private'), z.literal('medium'), z.literal('full')])
    .catch('medium'),
})

/** GET `api/v1/scores/[id]/[style]/[diff]` response type */
export type ScoreInfo = Omit<ScoreSchema, 'isPublic' | 'deleted'>

/** POST `api/v1/scores/[id]` expected router params */
export const postRouterParamsSchema = z.object({ id: scoreSchema.shape.songId })

/** POST `api/v1/scores/[id]` expected body */
export const postBodySchema = z
  .array(
    score.extend({
      playStyle: scoreSchema.shape.playStyle,
      difficulty: scoreSchema.shape.difficulty,
      topScore: scoreSchema.shape.score.optional(),
    })
  )
  .min(1)
