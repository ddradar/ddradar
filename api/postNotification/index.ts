import type { HttpRequest } from '@azure/functions'

import type { NotificationSchema } from '../core/db/notification'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../core/type-assert'
import { ErrorResult, SuccessResult } from '../function'

type NotificationBody = Partial<NotificationSchema> &
  Omit<NotificationSchema, 'id' | 'timeStamp'>

type PostNotificationResult = {
  httpResponse: ErrorResult<400> | SuccessResult<NotificationBody>
  document?: NotificationBody
}

function isNotificationBody(obj: unknown): obj is NotificationBody {
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

/** Add or update Notification. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'body'>
): Promise<PostNotificationResult> {
  if (!isNotificationBody(req.body)) {
    return { httpResponse: new ErrorResult(400) }
  }

  const document: NotificationBody = {
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
}
