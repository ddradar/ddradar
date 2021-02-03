import type { HttpRequest } from '@azure/functions'
import type { UserInfo } from '@ddradar/core/api/user'
import { AreaCode, areaCodeSet } from '@ddradar/core/db/users'
import { fetchUserList } from '@ddradar/db'

import { getClientPrincipal } from '../auth'
import { SuccessResult } from '../function'

const isArea = (obj: unknown): obj is AreaCode =>
  typeof obj === 'number' && (areaCodeSet as ReadonlySet<number>).has(obj)

/** Get user list that match the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<SuccessResult<UserInfo[]>> {
  const loginId = getClientPrincipal(req)?.userId ?? ''
  const area = parseFloat(req.query.area)
  const name = req.query.name
  const code = parseFloat(req.query.code)

  const body = await fetchUserList(
    loginId,
    isArea(area) && area ? area : undefined,
    name,
    Number.isInteger(code) && code >= 10000000 && code <= 99999999
      ? code
      : undefined
  )

  return new SuccessResult(body)
}
