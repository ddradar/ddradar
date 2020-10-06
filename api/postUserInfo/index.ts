import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import {
  fetchLoginUser,
  fetchUser,
  isUserSchema,
  UserSchema,
} from '../db/users'
import {
  BadRequestResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'

type PostUserResult = {
  httpResponse:
    | BadRequestResult
    | SuccessResult<UserSchema>
    | UnauthenticatedResult
  document?: UserSchema
}

/** Add or Update information about the currently logged in user. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'body' | 'headers'>
): Promise<PostUserResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }
  const loginId = clientPrincipal.userId

  if (!isUserSchema(req.body)) {
    return { httpResponse: { status: 400, body: 'Body is not UserSchema' } }
  }

  // Read existing data
  const oldData =
    (await fetchUser(req.body.id)) ?? (await fetchLoginUser(loginId))

  if (oldData && (oldData.id !== req.body.id || oldData.loginId !== loginId)) {
    return { httpResponse: { status: 400, body: 'Duplicated Id' } }
  }

  // Merge existing data with new data
  const body: UserSchema = {
    id: oldData?.id ?? req.body.id,
    name: req.body.name,
    area: oldData?.area ?? req.body.area,
    isPublic: req.body.isPublic,
    ...(req.body.code ? { code: req.body.code } : {}),
  }

  return {
    httpResponse: new SuccessResult(body),
    document: { ...body, loginId: oldData?.loginId ?? loginId },
  }
}
