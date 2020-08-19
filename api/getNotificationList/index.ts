import type { HttpRequest } from '@azure/functions'

import { getContainer } from '../cosmos'
import type { NotificationSchema } from '../db'
import type { SuccessResult } from '../function'

type Notification = Omit<NotificationSchema, 'sender' | 'pinned'>

/** Get system notification list. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>
): Promise<SuccessResult<Notification[]>> {
  const scope = req.query.scope === 'top' ? 'top' : 'full'

  const columns: (keyof Notification)[] = [
    'id',
    'type',
    'icon',
    'title',
    'body',
    '_ts',
  ]
  const condition = scope === 'top' ? 'WHERE c.pinned = true ' : ''
  const container = getContainer('Notification', true)
  const { resources } = await container.items
    .query<Notification>({
      query:
        'SELECT ' +
        `${columns.map(c => `c.${c}`).join(', ')} ` +
        'FROM c ' +
        condition +
        'ORDER BY c.pinned, c._ts DESC',
    })
    .fetchAll()

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
