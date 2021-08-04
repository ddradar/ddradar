import type { HttpRequest } from '@azure/functions'
import { privateUser, publicUser } from '@ddradar/core/__tests__/data'
import { fetchLoginUser } from '@ddradar/db'
import { mocked } from 'ts-jest/utils'

import { canReadUserData, getClientPrincipal, getLoginUserInfo } from '../auth'

jest.mock('@ddradar/db')

const toBase64 = (obj: unknown) => {
  const jsonString = JSON.stringify(obj)
  const utf8buffer = Buffer.from(jsonString)
  return utf8buffer.toString('base64')
}
const authHeader = 'x-ms-client-principal'

describe('auth.ts', () => {
  describe('getClientPrincipal', () => {
    const req: Pick<HttpRequest, 'headers'> = { headers: {} }
    beforeEach(() => (req.headers = {}))

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
      },
      {
        identityProvider: 'twitter',
        userDetails: 'twitter_admin_user',
        userId: '123456',
        userRoles: ['anonymous', 'authenticated', 'administrator'],
      },
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
      mocked(fetchLoginUser).mockResolvedValueOnce(publicUser)

      // Act
      const user = await getLoginUserInfo({ userId: 'registered_user' })

      // Assert
      expect(user).toBe(publicUser)
    })
  })

  describe('canReadUserData', () => {
    const req: Pick<HttpRequest, 'headers'> = { headers: {} }
    beforeEach(() => (req.headers = {}))

    test('({not login}, undefined) returns false', () =>
      expect(canReadUserData(req, undefined)).toBe(false))
    test('({not login}, publicUser) returns true', () =>
      expect(canReadUserData(req, publicUser)).toBe(true))
    test('({not login}, privateUser) returns false', () =>
      expect(canReadUserData(req, privateUser)).toBe(false))
    test('({login as privateUser}, privateUser) returns true', () => {
      // Arrange
      req.headers[authHeader] = toBase64({ userId: privateUser.loginId })

      // Act - Assert
      expect(canReadUserData(req, privateUser)).toBe(true)
    })
  })
})
