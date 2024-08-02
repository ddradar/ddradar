import { notificationSchema } from '@ddradar/core'
import { dbNotificationSchema } from '@ddradar/db'
import { z } from 'zod'

/** GET `/api/v2/notification/[id]` expected router params */
export const getRouterParamsSchema = notificationSchema.pick({ id: true })

/** GET `/api/v2/notification` expected query */
export const getListQuerySchema = z.object({
  scope: z.literal('top').optional().catch(undefined),
})

/** POST `/api/v2/notification` expected body */
export const postBodySchema = notificationSchema
  .omit({ id: true, timeStamp: true })
  .extend({
    id: z.ostring(),
    pinned: dbNotificationSchema.shape.pinned,
    timeStamp: z.onumber(),
  })
