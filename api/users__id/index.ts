import type { Context, HttpRequest } from '@azure/functions'
import { UserInfo } from '@ddradar/core/api/user'
import type { UserSchema } from '@ddradar/core/db/users'

import { getClientPrincipal } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Get user information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  [user]: UserSchema[]
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
