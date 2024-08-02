import { notificationSchema } from '@ddradar/core'
import { z } from 'zod'

/** zod schema object for {@link DBNotificationSchema}. */
export const dbNotificationSchema = notificationSchema.extend({
  /** To detect schema */
  type: z.literal('notification'),
  /** Notification sender */
  sender: z.literal('SYSTEM'),
  /** Display on the Top page or not */
  pinned: z.boolean(),
})
/**
 * DB schema of "Notification" container
 * @example
 * ```json
 * {
 *   "id": "<Auto Generated>",
 *   "sender": "SYSTEM",
 *   "pinned": true,
 *   "color": "yellow",
 *   "icon": "i-heroicons-exclamation-triangle",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *   "timeStamp": 1597028400
 * }
 * ```
 */
export type DBNotificationSchema = z.infer<typeof dbNotificationSchema>
