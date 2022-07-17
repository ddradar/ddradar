import type { CompatibilityEvent } from 'h3'

import type { UserInfo } from '~/server/api/v1/users/index.get'
import { tryFetchUser } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

/**
 * Get user information that match the specified ID.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/:id`
 *   - `id`: {@link UserInfo.id}
 * @param event HTTP Event
 * @returns
 * - Returns `404 Not Found` if `id` is not defined.
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * {
 *   "id": "afro0001",
 *   "name": "AFRO",
 *   "area": 13,
 *   "code": 10000000
 * }
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const user = await tryFetchUser(event)
  if (!user) return sendNullWithError(event, 404)

  const userInfo: UserInfo = {
    id: user.id,
    name: user.name,
    area: user.area,
    code: user.code,
  }
  return userInfo
}
