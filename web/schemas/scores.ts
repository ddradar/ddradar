import { scoreRecordSchema, songSchema, stepChartSchema } from '@ddradar/core'
import { z } from 'zod'

/** GET/POST/DELETE `/api/v2/scores/[id]/[style]/[diff]` expected router params */
export const routerParamsSchema = z.object({
  id: songSchema.shape.id,
  style: z.coerce.number().pipe(stepChartSchema.shape.playStyle),
  diff: z.coerce.number().pipe(stepChartSchema.shape.difficulty),
})

/** GET `/api/v2/scores/[id]/[style]/[diff]` expected query */
export const getQuerySchema = z.object({
  scope: z
    .union([z.literal('private'), z.literal('medium'), z.literal('full')])
    .catch('medium'),
})

/** POST `/api/v2/scores/[id]/[style]/[diff]` expected body */
export const postBodySchema = scoreRecordSchema
