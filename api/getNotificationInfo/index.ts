import type { Context } from '@azure/functions'

import type { NotificationSchema } from '../core/db/notification'
import { ErrorResult, SuccessResult } from '../function'

/** Get notification that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [notification]: NotificationSchema[]
): Promise<ErrorResult<404> | SuccessResult<NotificationSchema>> {
  if (!notification) {
    return new ErrorResult(404, `Not found course that id: "${bindingData.id}"`)
  }

  return new SuccessResult(notification)
}
