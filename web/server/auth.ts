import { Database } from '@ddradar/core'
import { fetchLoginUser, fetchUser } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'

type Role = 'anonymous' | 'authenticated' | 'administrator'

/**
 * User information provided by Azure
 * @see https://docs.microsoft.com/azure/static-web-apps/user-information
 */
export interface ClientPrincipal {
  /** The name of the identity provider. */
  identityProvider: 'github' | 'twitter'
  /** An Azure Static Web Apps-specific unique identifier for the user. */
  userId: string
  /** User Name (GitHub/Twitter) */
  userDetails: string
  /**
   * An array of the user's assigned roles.
   * @see https://docs.microsoft.com/azure/static-web-apps/authentication-authorization#roles
   */
  userRoles: ReadonlyArray<Role>
}

/**
 * Get {@link ClientPrincipal} from Request header.
 * @param event HTTP Event
 * @description https://docs.microsoft.com/azure/static-web-apps/user-information?tabs=javascript#api-functions
 */
export function useClientPrincipal(
  event: Pick<CompatibilityEvent, 'req'>
): ClientPrincipal | null {
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
  event: Pick<CompatibilityEvent, 'req'>
): Promise<Database.UserSchema | null> {
  const clientPrincipal = useClientPrincipal(event)
  if (!clientPrincipal) return null
  return await fetchLoginUser(clientPrincipal.userId)
}

/**
 * Check user visibility
 * @param event HTTP Event (needs [id] context)
 * @returns Database.UserSchema if user is public or same as login user. otherwise null.
 */
export async function tryFetchUser(
  event: Pick<CompatibilityEvent, 'req' | 'context'>
): Promise<Database.UserSchema | null> {
  const id: string = event.context.params.id
  if (!Database.isValidUserId(id)) return null

  const user = await fetchUser(id)
  if (!user) return null

  const loginId = useClientPrincipal(event)?.userId ?? ''
  return user.isPublic || user.loginId === loginId ? user : null
}
