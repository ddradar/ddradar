import type { HttpRequest } from '@azure/functions'
import { Database } from '@ddradar/core'
import { fetchLoginUser, fetchUser } from '@ddradar/db'

import { getClientPrincipal } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Return type of this function */
type PostUserResult = {
  /** HTTP output binding */
  httpResponse: ErrorResult<400 | 401> | SuccessResult<Database.UserSchema>
  /** Cosmos DB output binding */
  document?: Database.UserSchema
}

/**
 * Add or Update information about the currently logged in user.
 * @description
 * - `POST api/v1/user`
 * - Need Authentication.
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `400 Bad Request` if parameter is invalid.
 * - Returns `200 OK` with JSON body if succeed.
 * @example
 * ```jsonc
 * // Request Body & Response Body
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
  req: Pick<HttpRequest, 'body' | 'headers'>
): Promise<PostUserResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: new ErrorResult(401) }
  const loginId = clientPrincipal.userId

  if (!Database.isUserSchema(req.body)) {
    return { httpResponse: new ErrorResult(400, 'Body is not UserSchema') }
  }

  // Read existing data
  const oldData =
    (await fetchUser(req.body.id)) ?? (await fetchLoginUser(loginId))

  if (oldData && (oldData.id !== req.body.id || oldData.loginId !== loginId)) {
    return { httpResponse: new ErrorResult(400, 'Duplicated Id') }
  }

  // Merge existing data with new data
  const body: Database.UserSchema = {
    id: oldData?.id ?? req.body.id,
    name: req.body.name,
    area: oldData?.area ?? req.body.area,
    isPublic: req.body.isPublic,
    ...(req.body.code ? { code: req.body.code } : {}),
    ...(req.body.password ? { password: req.body.password } : {}),
  }

  return {
    httpResponse: new SuccessResult(body),
    document: { ...body, loginId: oldData?.loginId ?? loginId },
  }
}
