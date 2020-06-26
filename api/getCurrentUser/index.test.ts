import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import type { UserSchema } from '../db'
import getCurrentUser from '.'

jest.mock('../auth')

describe('GET /api/v1/user', () => {
  const req = { headers: {} }

  test('returns "404 Not Found" if not logged in', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValue(null)

    // Act
    const result = await getCurrentUser(null, req)

    // Assert
    expect(result.status).toBe(401)
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const publicUser: UserSchema = {
        id: 'public_user',
        loginId: '1',
        name: 'Public User',
        area: 13,
        code: 10000000,
        isPublic: true,
      } as const
      const privateUser: UserSchema = {
        id: 'private_user',
        loginId: '2',
        name: 'Private User',
        area: 0,
        isPublic: false,
      } as const

      beforeAll(async () => {
        await getContainer('Users').items.create(publicUser)
        await getContainer('Users').items.create(privateUser)
      })

      test('returns "404 Not Found" if user registration is not completed', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValue({
          identityProvider: 'github',
          userDetails: 'new_user',
          userId: '3',
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await getCurrentUser(null, req)

        // Assert
        expect(result.status).toBe(404)
      })

      test('returns "200 OK" with JSON body if user is publicUser', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValue({
          identityProvider: 'github',
          userDetails: publicUser.id,
          userId: publicUser.loginId,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await getCurrentUser(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({
          id: publicUser.id,
          name: publicUser.name,
          area: publicUser.area,
          code: publicUser.code,
        })
      })

      test('returns "200 OK" with JSON body if user is privateUser', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValue({
          identityProvider: 'twitter',
          userDetails: privateUser.id,
          userId: privateUser.loginId,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await getCurrentUser(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({
          id: privateUser.id,
          name: privateUser.name,
          area: privateUser.area,
        })
      })

      afterAll(async () => {
        await getContainer('Users').item(publicUser.id, publicUser.id).delete()
        await getContainer('Users')
          .item(privateUser.id, privateUser.id)
          .delete()
      })
    }
  )
})
