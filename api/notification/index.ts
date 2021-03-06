import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { SuccessResult } from '../function'

/** Get system notification list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  documents: Database.NotificationSchema[]
): Promise<SuccessResult<Api.NotificationListData[]>> {
  return new SuccessResult(
    documents
      .filter(n => req.query.scope !== 'top' || n.pinned)
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
