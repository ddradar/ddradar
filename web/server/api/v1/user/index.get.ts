import type { Database } from '@ddradar/core'

import { getLoginUserInfo } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

export type CurrentUserInfo = Omit<Database.UserSchema, 'loginId'>

/**
 * Get information about the currently logged in user.
 * @description
 * - Need Authentication.
 * - GET `api/v1/user`
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
export default defineEventHandler(async event => {
  const user = await getLoginUserInfo(event)
  if (!user) {
    return sendNullWithError(event, 404, 'User registration is not completed')
  }

  delete user.loginId
  return user as CurrentUserInfo
})
