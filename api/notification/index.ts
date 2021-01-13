import type { NotificationListData } from '../core/api/notification'
import { SuccessResult } from '../function'

/** Get system notification list. */
export default async function (
  _context: unknown,
  _req: unknown,
  documents: NotificationListData[]
): Promise<SuccessResult<NotificationListData[]>> {
  return new SuccessResult(documents)
}
