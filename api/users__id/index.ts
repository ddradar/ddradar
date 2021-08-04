import type { Context, HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { getClientPrincipal } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type UserInfo = Api.UserInfo

/**
 * Get user information that match the specified ID.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users/:id`
 *   - `id`: {@link UserInfo.id}
 * @param bindingData.id {@link UserInfo.id}
 * @param req HTTP Request (from HTTP trigger)
 * @param user User data (from Cosmos DB binding)
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
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  [user]: Database.UserSchema[]
): Promise<ErrorResult<404> | SuccessResult<UserInfo>> {
  const clientPrincipal = getClientPrincipal(req)
  const loginId = clientPrincipal?.userId ?? ''

  if (!user || (!user.isPublic && user.loginId !== loginId)) {
    return new ErrorResult(404, `Not found user that id: "${bindingData.id}"`)
  }

  const body: UserInfo = { id: user.id, name: user.name, area: user.area }
  if (user.code !== undefined) body.code = user.code

  return new SuccessResult(body)
}
