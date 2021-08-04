import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'
import { fetchLoginUser } from '@ddradar/db'

export function getClientPrincipal(
  req: Pick<HttpRequest, 'headers'>
): Api.ClientPrincipal | null {
  const header = req.headers['x-ms-client-principal']
  if (!header) return null

  try {
    const buffer = Buffer.from(header, 'base64')
    const jsonString = buffer.toString('utf8')
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

export async function getLoginUserInfo(
  clientPrincipal: Pick<Api.ClientPrincipal, 'userId'> | null
): Promise<Database.UserSchema | null> {
  if (!clientPrincipal) return null
  return fetchLoginUser(clientPrincipal.userId)
}

export type UserVisibility = Pick<Database.UserSchema, 'loginId' | 'isPublic'>
/**
 *
 * @param req Http request
 * @param user User data
 * @returns `true` if user is public or same as login user.
 */
export function canReadUserData(
  req: Pick<HttpRequest, 'headers'>,
  user: UserVisibility | undefined
): boolean {
  if (!user) return false
  const loginId = getClientPrincipal(req)?.userId ?? ''
  return user.isPublic || user.loginId === loginId
}
