import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

type NotificationResult = Omit<Api.NotificationInfo, 'id'> &
  Partial<Api.NotificationInfo>

type PostNotificationResult = {
  /** HTTP output binding */
  httpResponse: ErrorResult<400> | SuccessResult<NotificationResult>
  /** Cosmos DB output binding */
  document?: NotificationResult
}

/**
 * Add or update Notification.
 * @description
 * - `POST /api/v1/notification`
 * - Need Authentication with `administrator` role.
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @returns
 * - Returns `401 Unauthorized` if user is not authenticated or does not have `administrator` role.
 * - Returns `400 BadRequest` if `req.body` is invalid.
 * - Returns `200 OK` with updated JSON data if succeed add or update.
 * @example
 * ```json
 * {
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
  _context: unknown,
  req: Pick<HttpRequest, 'body'>
): Promise<PostNotificationResult> {
  if (!isNotificationBody(req.body)) {
    return { httpResponse: new ErrorResult(400) }
  }

  const document: NotificationResult = {
    sender: req.body.sender,
    pinned: req.body.pinned,
    type: req.body.type,
    icon: req.body.icon,
    title: req.body.title,
    body: req.body.body,
    timeStamp: req.body.timeStamp || Math.floor(Date.now() / 1000),
    ...(req.body.id ? { id: req.body.id } : {}),
  }

  return { httpResponse: new SuccessResult(document), document }

  /** Type assertion for {@link Api.NotificationBody}. */
  function isNotificationBody(obj: unknown): obj is Api.NotificationBody {
    return (
      hasStringProperty(obj, 'sender', 'type', 'icon', 'title', 'body') &&
      obj.sender === 'SYSTEM' &&
      ['is-info', 'is-warning'].includes(obj.type) &&
      hasProperty(obj, 'pinned') &&
      typeof obj.pinned === 'boolean' &&
      (!hasProperty(obj, 'id') || hasStringProperty(obj, 'id')) &&
      (!hasProperty(obj, 'timeStamp') || hasIntegerProperty(obj, 'timeStamp'))
    )
  }
}
