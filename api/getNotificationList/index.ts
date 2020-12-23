import type { HttpRequest } from '@azure/functions'

import type { NotificationListData } from '../core/api/notification'
import type { NotificationSchema } from '../core/db/notification'
import { SuccessResult } from '../function'

/** Get system notification list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  documents: NotificationSchema[]
): Promise<SuccessResult<NotificationListData[]>> {
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
