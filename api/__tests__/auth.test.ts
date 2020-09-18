import type { Container } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { ClientPrincipal, getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer, UserSchema } from '../db'

jest.mock('../db')

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
    let resources: UserSchema[] = []
    const container = {
      items: {
        query: () => ({
          fetchAll: async () => ({ resources }),
        }),
      },
    }
    beforeAll(() => {
      mocked(getContainer).mockReturnValue((container as unknown) as Container)
    })

    test('(null) returns null', async () => {
      // Arrange - Act
      const user = await getLoginUserInfo(null)

      // Assert
      expect(user).toBeNull()
    })

    test('({ Unregistered user }) returns null', async () => {
      // Arrange
      resources = []

      // Act
      const user = await getLoginUserInfo({ userId: 'unregistered_user' })

      // Assert
      expect(user).toBeNull()
    })

    test('({ Registered user }) returns UserSchema', async () => {
      // Arrange
      const userSchema: UserSchema = {
        id: 'registered_user',
        loginId: 'registered_user',
        area: 0,
        isPublic: false,
        name: 'Registered user',
      }
      resources = [userSchema]

      // Act
      const user = await getLoginUserInfo({ userId: 'registered_user' })

      // Assert
      expect(user).toBe(userSchema)
    })
  })
})
