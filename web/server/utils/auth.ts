import { type UserSchema, userSchema } from '@ddradar/core'
import { fetchLoginUser, fetchUser } from '@ddradar/db'
import type { H3Event } from 'h3'

/**
 * Get {@link ClientPrincipal} from Request header.
 * @param event HTTP Event
 * @description https://docs.microsoft.com/azure/static-web-apps/user-information?tabs=javascript#api-functions
 */
export function useClientPrincipal(
  headers: Pick<H3Event, 'node'>['node']['req']['headers']
): ClientPrincipal | null {
  const header = headers['x-ms-client-principal']
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
  event: H3Event
): Promise<UserSchema | null> {
  const clientPrincipal = getClientPrincipal(event)
  if (!clientPrincipal) return null
  return await fetchLoginUser(clientPrincipal.userId)
}

/**
 * Check user visibility
 * @param event HTTP Event (needs [id] context)
 * @returns UserSchema if user is public or same as login user. otherwise null.
 */
export async function tryFetchUser(event: H3Event): Promise<UserSchema | null> {
  const id: string = event.context.params!.id
  if (!userSchema.shape.id.safeParse(id).success) return null

  const user = await fetchUser(id)
  if (!user) return null

  const loginId = getClientPrincipal(event)?.userId ?? ''
  return user.isPublic || user.loginId === loginId ? user : null
}
