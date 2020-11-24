import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { AreaCode, areaCodeList } from '../core/db/users'
import { PromiseType } from '../core/promise-type'
import { fetchUserList } from '../db/users'
import { SuccessResult } from '../function'

type UserList = PromiseType<ReturnType<typeof fetchUserList>>
const isArea = (obj: unknown): obj is AreaCode =>
  typeof obj === 'number' && (areaCodeList as number[]).includes(obj)

/** Get user list that match the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<SuccessResult<UserList>> {
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
