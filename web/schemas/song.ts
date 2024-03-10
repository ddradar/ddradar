import type { SongSchema, StepChartSchema } from '@ddradar/core'
import { seriesSet, songSchema, stepChartSchema } from '@ddradar/core'
import { z } from 'zod'

/** GET `api/v1/songs/[id]` expected router params */
export const getRouterParamsSchema = songSchema.pick({ id: true })

/** GET `api/v1/songs/[id]` response type */
export type SongInfo = Omit<SongSchema, 'skillAttackId'>

/** GET `/api/v1/songs` expected query */
export const getListQuerySchema = z.object({
  name: z.coerce
    .number()
    .pipe(songSchema.shape.nameIndex)
    .optional()
    .catch(undefined),
  series: z.coerce
    .number()
    .int()
    .min(0)
    .max(seriesSet.size - 1)
    .optional()
    .catch(undefined),
})

/** GET `/api/v1/songs` response type */
export type SongListData = Omit<SongSchema, 'skillAttackId' | 'charts'>

/** GET `/api/v1/charts/[style]/[level]` expected router params */
export const getChartsRouterParamsSchema = z.object({
  style: z.coerce.number().pipe(stepChartSchema.shape.playStyle),
  level: z.coerce.number().pipe(stepChartSchema.shape.level),
})

/** GET `/api/v1/charts/[style]/[level]` response type */
export type ChartInfo = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>
