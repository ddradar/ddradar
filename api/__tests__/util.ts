import type { HttpRequest } from '@azure/functions'

import { ClientPrincipal } from '../auth'

export const describeIf = (cond: () => boolean): jest.Describe =>
  cond() ? describe : describe.skip

export const addClientPrincipalHeader = (
  req: Pick<HttpRequest, 'headers'>,
  userId: string
): void => {
  const client: ClientPrincipal = {
    identityProvider: 'github',
    userDetails: 'user',
    userId,
    userRoles: ['anonymous', 'authenticated'],
  }
  const jsonString = JSON.stringify(client)
  const utf8buffer = Buffer.from(jsonString)
  req.headers['x-ms-client-principal'] = utf8buffer.toString('base64')
}
