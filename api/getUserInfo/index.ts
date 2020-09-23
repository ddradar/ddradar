import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import type { UserSchema } from '../db'
import type { NotFoundResult, SuccessResult } from '../function'

type UserInfo = Omit<UserSchema, 'loginId' | 'isPublic'>

/** Get user information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  documents: UserSchema[]
): Promise<NotFoundResult | SuccessResult<UserInfo>> {
  const id: string = context.bindingData.id
  const clientPrincipal = getClientPrincipal(req)
  const loginId = clientPrincipal?.userId ?? ''

  if (!documents || documents.length !== 1) {
    return { status: 404, body: `Not found user that id: "${id}"` }
  }

  const user = documents[0]
  if (!user.isPublic && user.loginId !== loginId) {
    return { status: 404, body: `Not found user that id: "${id}"` }
  }

  const body: UserInfo = { id: user.id, name: user.name, area: user.area }
  if (user.code !== undefined) body.code = user.code

  return { status: 200, headers: { 'Content-type': 'application/json' }, body }
}
