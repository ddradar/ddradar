import { z } from 'zod'

import type { Notification } from './graphql'

/** zod schema object for {@link NotificationSchema}. */
export const notificationSchema = z.object({
  id: z.ostring(),
  sender: z.literal('SYSTEM'),
  pinned: z.boolean(),
  type: z.string(),
  icon: z.string(),
  title: z.string(),
  body: z.string(),
  timeStamp: z.number(),
}) satisfies z.ZodType<Notification>
/**
 * DB schema of "Notification" container
 * @example
 * ```json
 * {
 *   "id": "<Auto Generated>",
 *   "sender": "SYSTEM",
 *   "pinned": true,
 *   "type": "is-info",
 *   "icon": "info",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *   "timeStamp": 1597028400
 * }
 * ```
 */
export type NotificationSchema = Notification &
  z.infer<typeof notificationSchema>

/** Type assertion for {@link NotificationSchema}. */
export function isNotificationSchema(obj: unknown): obj is NotificationSchema {
  return notificationSchema
    .omit({ timeStamp: true })
    .extend({ timeStamp: z.onumber() })
    .safeParse(obj).success
}
