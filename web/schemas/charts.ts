import { stepChartSchema } from '@ddradar/core'
import { z } from 'zod'

import type handler from '~~/server/api/v2/charts/[style]/[level].get'

/** GET `/api/v2/charts/[style]/[level]` expected router params */
export const getRouterParamsSchema = z.object({
  style: z.coerce.number().pipe(stepChartSchema.shape.playStyle),
  level: z.coerce.number().pipe(stepChartSchema.shape.level),
})

/** GET `/api/v2/charts/[style]/[level]` response type */
export type GetResponse = Awaited<ReturnType<typeof handler>>
