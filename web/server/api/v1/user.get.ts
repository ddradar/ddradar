import type { Database } from '@ddradar/core'
import type { CompatibilityEvent } from 'h3'

import { getLoginUserInfo, useClientPrincipal } from '../../auth'

export type CurrentUserInfo = Omit<Database.UserSchema, 'loginId'>

/**
 * Get information about the currently logged in user.
 * @description
 * - Need Authentication.
 * - GET `api/v1/user`
 * @param event HTTP Event
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if user registration is not completed.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * {
 *   "id": "afro0001",
 *   "name": "AFRO",
 *   "area": 13,
 *   "code": 10000000,
 *   "isPublic": false,
 *   "password": "********"
 * }
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const user = await getLoginUserInfo(useClientPrincipal(event))
  if (!user) {
    event.res.statusCode = 404
    throw new Error('User registration is not completed')
  }

  delete user.loginId
  return user as CurrentUserInfo
}
