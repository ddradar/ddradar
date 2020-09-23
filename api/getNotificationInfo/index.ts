import type { Context } from '@azure/functions'

import type { NotificationSchema } from '../db'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get notification that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: NotificationSchema[]
): Promise<NotFoundResult | SuccessResult<NotificationSchema>> {
  if (!documents || documents.length !== 1) {
    const id = bindingData.id
    return { status: 404, body: `Not found course that id: "${id}"` }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: documents[0],
  }
}
