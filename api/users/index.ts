import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { Database } from '@ddradar/core'
import { fetchUserList } from '@ddradar/db'

import { getClientPrincipal } from '../auth'
import { SuccessResult } from '../function'

type UserInfo = Api.UserInfo

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
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<SuccessResult<UserInfo[]>> {
  const loginId = getClientPrincipal(req)?.userId ?? ''
  const area = parseFloat(req.query.area ?? '')
  const name = req.query.name ?? ''
  const code = parseFloat(req.query.code ?? '')

  const body = await fetchUserList(
    loginId,
    isArea(area) && area ? area : undefined,
    name,
    Number.isInteger(code) && code >= 10000000 && code <= 99999999
      ? code
      : undefined
  )

  return new SuccessResult(body)

  function isArea(obj: unknown): obj is Database.AreaCode {
    return (
      typeof obj === 'number' &&
      (Database.areaCodeSet as ReadonlySet<number>).has(obj)
    )
  }
}
