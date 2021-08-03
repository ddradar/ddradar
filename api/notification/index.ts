import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { SuccessResult } from '../function'

/**
 * Get system notification list.
 * @description
 * - `GET api/v1/notification?scope=top`
 * - No need Authentication.
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param documents Notification data (from Cosmos DB input binding)
 * @returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "<Auto Generated>",
 *     "type": "is-info",
 *     "icon": "info",
 *     "title": "このサイトはベータ版です",
 *     "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *     "timeStamp": 1597028400
 *   }
 * ]
 * ```
 */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  documents: Database.NotificationSchema[]
): Promise<SuccessResult<Api.NotificationListData[]>> {
  /** `top`: only pinned notification */
  const scope = req.query.scope
  return new SuccessResult(
    documents
      .filter(n => scope !== 'top' || n.pinned)
      .map(n => ({
        id: n.id,
        type: n.type,
        icon: n.icon,
        title: n.title,
        body: n.body,
        timeStamp: n.timeStamp,
      }))
  )
}
