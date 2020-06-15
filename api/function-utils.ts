import type { HttpRequest } from '@azure/functions'

type ClientPricipal = {
  identityProvider: 'facebook' | 'github' | 'twitter' | 'google' | 'aad'
  userId: string
  userDetails: string
  userRoles: string[]
}

export const getClientPrincipal = ({
  headers,
}: Pick<HttpRequest, 'headers'>): ClientPricipal | null => {
  const base64String = headers['x-ms-client-principal']
  if (!base64String) return null
  const rawByteJson = Buffer.from(base64String, 'base64')
  return JSON.parse(rawByteJson.toString('utf8'))
}

export const hasRole = (
  req: Pick<HttpRequest, 'headers'>,
  roleName: string
): boolean => getClientPrincipal(req)?.userRoles.includes(roleName) ?? false

export const getUserId = (req: Pick<HttpRequest, 'headers'>): string | null =>
  getClientPrincipal(req)?.userId ?? null
