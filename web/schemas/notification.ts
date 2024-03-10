import type { NotificationSchema } from '@ddradar/core'
import { notificationSchema } from '@ddradar/core'
import { z } from 'zod'

/** GET `api/v1/notification/[id]` expected router params */
export const getRouterParamsSchema = z.object({ id: z.string() })

/** GET `api/v1/notification/[id]` response type */
export type NotificationInfo = Required<NotificationSchema>

/** GET `/api/v1/songs` expected query */
export const getListQuerySchema = z.object({
  scope: z.literal('top').optional().catch(undefined),
})

/** GET `/api/v1/songs` response type */
export type NotificationListData = Omit<
  Required<NotificationSchema>,
  'sender' | 'pinned'
>

/** POST `api/v1/notification` expected body */
export const postBodySchema = notificationSchema
  .omit({ timeStamp: true })
  .extend({ timeStamp: z.onumber() })
