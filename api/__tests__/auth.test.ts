import type { HttpRequest } from '@azure/functions'

import { ClientPrincipal, getClientPrincipal } from '../auth'

const toBase64 = (obj: unknown) => {
  const jsonString = JSON.stringify(obj)
  const utf8buffer = Buffer.from(jsonString)
  return utf8buffer.toString('base64')
}
const authHeader = 'x-ms-client-principal'

describe('./auth.ts', () => {
  describe('getClientPrincipal', () => {
    let req: Pick<HttpRequest, 'headers'>
    beforeEach(() => {
      req = { headers: {} }
    })

    test.each(['', 'foo'])(`({ ${authHeader} : %s }) returns null`, header => {
      // Arrange
      req.headers[authHeader] = header

      // Act
      const clientPrincipal = getClientPrincipal(req)

      // Assert
      expect(clientPrincipal).toBe(null)
    })

    test.each([
      {
        identityProvider: 'github',
        userDetails: 'github_user',
        userId: 'abcdef',
        userRoles: ['anonymous', 'authenticated'],
      } as ClientPrincipal,
      {
        identityProvider: 'twitter',
        userDetails: 'twitter_admin_user',
        userId: '123456',
        userRoles: ['anonymous', 'authenticated', 'administrator'],
      } as ClientPrincipal,
    ])(
      `({ ${authHeader} : toBase64(%p) }) returns same object`,
      (expected: ClientPrincipal) => {
        // Arrange
        const header = toBase64(expected)
        req.headers[authHeader] = header

        // Act
        const clientPrincipal = getClientPrincipal(req)

        // Assert
        expect(clientPrincipal).toStrictEqual(expected)
      }
    )
  })
})
