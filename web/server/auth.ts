import type { Api, Database } from '@ddradar/core'
import { fetchLoginUser } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'
import { appendHeader } from 'h3'

export function useClientPrincipal(
  event: Pick<CompatibilityEvent, 'req'>
): Api.ClientPrincipal | null {
  const header = event.req.headers['x-ms-client-principal']
  if (typeof header !== 'string') return null

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
  return await fetchLoginUser(clientPrincipal.userId)
}

export type UserVisibility = Pick<Database.UserSchema, 'loginId' | 'isPublic'>
/**
 * @param event HTTP Event
 * @param user User data
 * @returns `true` if user is public or same as login user.
 */
export function canReadUserData(
  event: Pick<CompatibilityEvent, 'req'>,
  user: UserVisibility | undefined
): boolean {
  if (!user) return false
  const loginId = useClientPrincipal(event)?.userId ?? ''
  return user.isPublic || user.loginId === loginId
}

/**
 * Add Response header for CORS.
 * @param event HTTP Event
 */
export function addCORSHeader(event: CompatibilityEvent) {
  appendHeader(event, 'Access-Control-Allow-Origin', 'https://p.eagate.573.jp')
  appendHeader(event, 'Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  appendHeader(event, 'Access-Control-Allow-Credentials', 'true')
}
