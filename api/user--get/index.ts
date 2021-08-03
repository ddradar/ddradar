import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/**
 * Get information about the currently logged in user.
 * @description
 * - `GET api/v1/user`
 * - Need Authentication.
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
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
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>
): Promise<ErrorResult<404> | SuccessResult<Api.CurrentUserInfo>> {
  const user = await getLoginUserInfo(getClientPrincipal(req))

  if (!user) {
    return new ErrorResult(404, 'User registration is not completed')
  }
  delete user.loginId

  return new SuccessResult(user)
}
