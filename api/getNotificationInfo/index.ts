import type { Context } from '@azure/functions'

import type { NotificationSchema } from '../db'
import { ErrorResult, SuccessResult } from '../function'

/** Get notification that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [notification]: NotificationSchema[]
): Promise<ErrorResult<404> | SuccessResult<NotificationSchema>> {
  if (!notification) {
    const id = bindingData.id
    return { status: 404, body: `Not found course that id: "${id}"` }
  }

  return new SuccessResult(notification)
}
