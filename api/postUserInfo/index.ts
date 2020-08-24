import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../cosmos'
import { areaCodeList, UserSchema } from '../db/users'
import type {
  BadRequestResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../type-assert'

export type UserInfo = Omit<UserSchema, 'loginId'>

const isUserInfo = (obj: unknown): obj is UserInfo =>
  hasStringProperty(obj, 'id', 'name') &&
  /^[-a-z0-9_]+$/.test(obj.id) &&
  hasIntegerProperty(obj, 'area') &&
  (areaCodeList as number[]).includes(obj.area) &&
  (!hasProperty(obj, 'code') ||
    (hasIntegerProperty(obj, 'code') &&
      obj.code >= 10000000 &&
      obj.code <= 99999999)) &&
  hasProperty(obj, 'isPublic') &&
  typeof obj.isPublic === 'boolean'

type PostUserResult = {
  httpResponse:
    | BadRequestResult
    | SuccessResult<UserInfo>
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

  if (!isUserInfo(req.body)) {
    return { httpResponse: { status: 400, body: 'Body is not UserSchema' } }
  }

  // Read existing data
  const container = getContainer('Users', true)
  const { resources } = await container.items
    .query<UserSchema>({
      query: 'SELECT * FROM c WHERE c.id = @id OR c.loginId = @loginId',
      parameters: [
        { name: '@id', value: req.body.id },
        { name: '@loginId', value: loginId },
      ],
    })
    .fetchAll()
  const oldData = resources[0]

  if (oldData && (oldData.id !== req.body.id || oldData.loginId !== loginId)) {
    return { httpResponse: { status: 400, body: 'Duplicated Id' } }
  }

  // Merge existing data with new data
  const document: UserSchema = {
    loginId: oldData?.loginId ?? loginId,
    id: oldData?.id ?? req.body.id,
    name: req.body.name,
    area: oldData?.area ?? req.body.area,
    isPublic: req.body.isPublic,
    ...(req.body.code ? { code: req.body.code } : {}),
  }

  // Create response
  const body: UserInfo = {
    id: document.id,
    name: document.name,
    area: document.area,
    isPublic: document.isPublic,
  }
  if (document.code) body.code = document.code

  return {
    httpResponse: {
      status: 200,
      headers: { 'Content-type': 'application/json' },
      body,
    },
    document,
  }
}
