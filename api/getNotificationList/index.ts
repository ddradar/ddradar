import type { HttpRequest } from '@azure/functions'
import type { NotificationSchema } from '@ddradar/core/db/notification'

import { SuccessResult } from '../function'

type Notification = Omit<NotificationSchema, 'sender' | 'pinned'>

/** Get system notification list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  documents: NotificationSchema[]
): Promise<SuccessResult<Notification[]>> {
  const scope = req.query.scope === 'top' ? 'top' : 'full'

  const body = documents
    .filter(n => scope === 'full' || n.pinned)
    .map(n => ({
      id: n.id,
      type: n.type,
      icon: n.icon,
      title: n.title,
      body: n.body,
      timeStamp: n.timeStamp,
    }))

  return new SuccessResult(body)
}
