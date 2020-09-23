import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { fetchLoginUser } from '../db/users'
import { NotFoundResult, SuccessResult } from '../function'
import { User } from '../user'

/** Get information about the currently logged in user. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>
): Promise<NotFoundResult | SuccessResult<User>> {
  const clientPrincipal = getClientPrincipal(req)

  const loginId = clientPrincipal?.userId

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- routes.json
  const user = await fetchLoginUser(loginId!)

  if (!user) {
    return { status: 404, body: 'User registration is not completed' }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: { id: user.id, name: user.name, area: user.area, code: user.code },
  }
}
