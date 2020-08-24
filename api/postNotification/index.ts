import type { HttpRequest } from '@azure/functions'

import { NotificationSchema } from '../db'
import type { BadRequestResult, SuccessResult } from '../function'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../type-assert'

type NotificationBody = Partial<NotificationSchema> &
  Omit<NotificationSchema, 'id' | 'timeStamp'>

type PostNotificationResult = {
  httpResponse: BadRequestResult | SuccessResult<NotificationBody>
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
    return {
      httpResponse: { status: 400, body: 'Body is not NotificationSchema' },
    }
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

  return {
    httpResponse: {
      status: 200,
      headers: { 'Content-type': 'application/json' },
      body: document,
    },
    document,
  }
}
