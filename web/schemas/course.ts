import type { CourseChartSchema, CourseSchema } from '@ddradar/core'
import { courseSchema, seriesSet } from '@ddradar/core'
import { z } from 'zod'

/** GET `api/v1/courses/[id]` expected router params */
export const getRouterParamsSchema = courseSchema.pick({ id: true })

/** GET `api/v1/courses/[id]` response type */
export type CourseInfo = CourseSchema

/** GET `api/v1/courses` expected query */
export const getListQuerySchema = z.object({
  series: z.coerce
    .number()
    .int()
    .min(0)
    .max(seriesSet.size - 1)
    .optional()
    .catch(undefined),
  type: z.coerce.number().int().min(1).max(2).optional().catch(undefined),
})

/** GET `api/v1/courses` response type */
export type CourseListData = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  /** Course difficulties (omitted) */
  charts: Pick<CourseChartSchema, 'playStyle' | 'difficulty' | 'level'>[]
}
