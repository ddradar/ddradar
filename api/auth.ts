import type { HttpRequest } from '@azure/functions'
import type { ClientPrincipal } from '@ddradar/core/api/auth'
import type { UserSchema } from '@ddradar/core/db/users'
import { fetchLoginUser } from '@ddradar/db'

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
