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

type UserInfo = Pick<UserSchema, 'name' | 'area' | 'code' | 'isPublic'> & {
  /** User id (used for user page URL) */
  id: string
}

const isUserInfo = (obj: unknown): obj is UserInfo =>
  hasStringProperty(obj, 'id', 'name') &&
  hasIntegerProperty(obj, 'area') &&
  (areaCodeList as number[]).includes(obj.area) &&
  (!hasProperty(obj, 'code') ||
    (hasIntegerProperty(obj, 'code') &&
      obj.code >= 10000000 &&
      obj.code <= 99999999)) &&
  hasProperty(obj, 'isPublic') &&
  typeof obj.isPublic === 'boolean'

/** Add or Update information about the currently logged in user. */
const httpTrigger = async (
  _context: unknown,
  req: Pick<HttpRequest, 'body' | 'headers'>
): Promise<
  BadRequestResult | SuccessResult<UserInfo> | UnauthenticatedResult
> => {
  const clientPrincipal = getClientPrincipal(req)
  // This check is only used to unit tests.
  if (!clientPrincipal) return { status: 401 }

  const id = clientPrincipal.userId

  if (!isUserInfo(req.body)) {
    return {
      status: 400,
      body: 'Body is not UserSchema',
    }
  }

  const user: UserSchema = {
    id,
    displayedId: req.body.id,
    name: req.body.name,
    area: req.body.area,
    isPublic: req.body.isPublic,
  }
  if (req.body.code) user.code = req.body.code

  const container = getContainer('Songs')
  const { resource } = await container.items.upsert<UserSchema>(user)
  if (!resource) throw new Error(`Failed upsert id:${req.body.id}`)
  const responseBody: UserInfo = {
    id: resource.displayedId,
    name: resource.name,
    area: resource.area,
    isPublic: resource.isPublic,
  }
  if (resource.code) responseBody.code = resource.code

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: responseBody,
  }
}

export default httpTrigger
