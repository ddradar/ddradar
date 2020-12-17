import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { ClientPrincipal, getClientPrincipal, getLoginUserInfo } from '../auth'
import { fetchLoginUser } from '../db/users'

jest.mock('../db/users')

const toBase64 = (obj: unknown) => {
  const jsonString = JSON.stringify(obj)
  const utf8buffer = Buffer.from(jsonString)
  return utf8buffer.toString('base64')
}
const authHeader = 'x-ms-client-principal'

describe('./auth.ts', () => {
  describe('getClientPrincipal', () => {
    const req: Pick<HttpRequest, 'headers'> = { headers: {} }
    beforeEach(() => {
      req.headers = {}
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
    ])(`({ ${authHeader} : toBase64(%p) }) returns same object`, expected => {
      // Arrange
      const header = toBase64(expected)
      req.headers[authHeader] = header

      // Act
      const clientPrincipal = getClientPrincipal(req)

      // Assert
      expect(clientPrincipal).toStrictEqual(expected)
    })
  })

  describe('getLoginUserInfo', () => {
    test('(null) returns null', async () => {
      // Arrange - Act
      const user = await getLoginUserInfo(null)

      // Assert
      expect(user).toBeNull()
    })

    test('({ Unregistered user }) returns null', async () => {
      // Arrange
      mocked(fetchLoginUser).mockResolvedValueOnce(null)

      // Act
      const user = await getLoginUserInfo({ userId: 'unregistered_user' })

      // Assert
      expect(user).toBeNull()
    })

    test('({ Registered user }) returns UserSchema', async () => {
      // Arrange
      const userSchema = {
        id: 'registered_user',
        loginId: 'registered_user',
        area: 0,
        isPublic: false,
        name: 'Registered user',
      } as const
      mocked(fetchLoginUser).mockResolvedValueOnce(userSchema)

      // Act
      const user = await getLoginUserInfo({ userId: 'registered_user' })

      // Assert
      expect(user).toBe(userSchema)
    })
  })
})
