import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { AreaCode, areaCodeList, fetchUserList, UserSchema } from '../db/users'
import type { SuccessResult } from '../function'

const isArea = (obj: unknown): obj is AreaCode =>
  typeof obj === 'number' && (areaCodeList as number[]).includes(obj)

/** Get user list that match the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<SuccessResult<Omit<UserSchema, 'loginId' | 'isPublic'>[]>> {
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

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
