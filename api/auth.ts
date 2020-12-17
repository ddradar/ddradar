import type { HttpRequest } from '@azure/functions'

import type { UserSchema } from './core/db/users'
import { fetchLoginUser } from './db/users'

type Role = 'anonymous' | 'authenticated' | 'administrator'

/** User information provided by Azure */
export type ClientPrincipal = {
  /** The name of the identity provider. */
  identityProvider: 'github' | 'twitter'
  /** An Azure Static Web Apps-specific unique identifier for the user. */
  userId: string
  /** User Name (GitHub/Twitter) */
  userDetails: string
  /** An array of the user's assigned roles. */
  userRoles: Role[]
}

export function getClientPrincipal(
  req: Pick<HttpRequest, 'headers'>
): ClientPrincipal | null {
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
  clientPrincipal: Pick<ClientPrincipal, 'userId'> | null
): Promise<UserSchema | null> {
  if (!clientPrincipal) return null
  return fetchLoginUser(clientPrincipal.userId)
}
