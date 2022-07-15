import type { Database } from '@ddradar/core'
import { fetchLoginUser } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'

type Role = 'anonymous' | 'authenticated' | 'administrator'

/**
 * User information provided by Azure
 * @see https://docs.microsoft.com/azure/static-web-apps/user-information
 */
export interface ClientPrincipal  {
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
  clientPrincipal: Pick<ClientPrincipal, 'userId'> | null
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
