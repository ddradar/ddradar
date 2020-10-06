import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { UserSchema } from '../db/users'
import { ErrorResult, SuccessResult } from '../function'

/** Get information about the currently logged in user. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>
): Promise<ErrorResult<404> | SuccessResult<Omit<UserSchema, 'loginId'>>> {
  const user = await getLoginUserInfo(getClientPrincipal(req))

  if (!user) {
    return { status: 404, body: 'User registration is not completed' }
  }
  delete user.loginId

  return new SuccessResult(user)
}
