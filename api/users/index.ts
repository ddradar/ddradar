import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { Database } from '@ddradar/core'

import { getClientPrincipal } from '../auth'
import { SuccessResult } from '../function'

type UserInfo = Omit<Database.UserSchema, 'password'> &
  Required<Pick<Database.UserSchema, 'loginId'>>

/**
 * Get user list that match the specified conditions.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users?area=:area&name=:name&code=:code`
 *   - `area`(optional): {@link UserInfo.area}
 *   - `name`(optional): {@link UserInfo.name} (partial match)
 *   - `code`(optional): {@link UserInfo.code}
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param users User data (from Cosmos DB binding)
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "afro0001",
 *     "name": "AFRO",
 *     "area": 13,
 *     "code": 10000000
 *   },
 *   {
 *     "id": "emi",
 *     "name": "TOSHIBA EMI",
 *     "area": 0
 *   }
 * ]
 * ```
 */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  users: UserInfo[]
): Promise<SuccessResult<Api.UserInfo[]>> {
  const loginId = getClientPrincipal(req)?.userId ?? ''
  const area = parseFloat(req.query.area ?? '')
  const name = req.query.name ?? ''
  const code = parseFloat(req.query.code ?? '')

  const body = users
    .filter(
      d =>
        (d.isPublic || d.loginId === loginId) &&
        (!(Database.areaCodeSet as Set<number>).has(area) || d.area === area) &&
        (!name || d.name.includes(name)) &&
        (!isVaildCode(code) || d.code === code)
    )
    .map(d => ({
      id: d.id,
      name: d.name,
      area: d.area,
      ...(d.code ? { code: d.code } : {}),
    }))

  return new SuccessResult(body)

  function isVaildCode(code: number): boolean {
    return Number.isInteger(code) && code >= 10000000 && code <= 99999999
  }
}
