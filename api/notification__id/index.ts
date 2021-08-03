import type { Context } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

type NotificationSchema = Database.NotificationSchema

/**
 * Get notification that match the specified ID.
 * @description
 * - `GET api/v1/notification/:id`
 * - No need Authentication.
 * @param bindingData.id {@link NotificationSchema.id}
 * @param _req HTTP Request (unused)
 * @param notification Notification data (from Cosmos DB binding)
 * @returns
 * - Returns `404 Not Found` if no data that matches `id`.
 * - Returns `200 OK` with JSON body if found.
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
 *   "timeStamp": 1597024800
 * }
 * ```
 */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [notification]: NotificationSchema[]
): Promise<ErrorResult<404> | SuccessResult<Api.NotificationInfo>> {
  if (!notification) {
    return new ErrorResult(404, `Not found course that id: "${bindingData.id}"`)
  }

  return new SuccessResult(notification)
}
