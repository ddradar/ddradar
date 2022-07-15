import type { NotificationSchema } from '../db/notification'

/**
 * Request body of POST `/api/v1/notification`
 * @see https://github.com/ddradar/ddradar/tree/master/api/notification--post/
 */
export type NotificationBody = Partial<NotificationSchema> &
  Omit<NotificationSchema, 'id' | 'timeStamp'>
