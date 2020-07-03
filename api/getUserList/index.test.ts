import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import type { UserSchema } from '../db'
import { AreaCode } from '../db/users'
import { User } from '../user'
import getUserList, { UserListResponse } from '.'

jest.mock('../auth')

describe('GET /api/v1/users', () => {
  let req: Pick<HttpRequest, 'headers' | 'query'>

  beforeEach(() => {
    req = { headers: {}, query: {} }
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const users: UserSchema[] = [...Array(100).keys()].map(i => ({
        id: `user_${i}`,
        loginId: `${i}`,
        name: `User ${i}`,
        area: (i % 50) as AreaCode,
        isPublic: i !== 0,
        code: 10000000 + i,
      }))

      beforeAll(async () => {
        for (const user of users) {
          await getContainer('Users').items.create(user)
        }
      })

      test('returns users without private user', async () => {
        // Arrange
        req.query = { name: '0' }

        // Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect((result.body as UserListResponse).result).toHaveLength(9)
        expect((result.body as UserListResponse).next).toBe(null)
      })

      test('returns users with logged in user', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: users[0].id,
          userId: users[0].loginId,
          userRoles: ['anonymous', 'authenticated'],
        })
        req.query = { name: '0' }

        // Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect((result.body as UserListResponse).result).toHaveLength(10)
        expect((result.body as UserListResponse).next).toBe(null)
      })

      test('returns users with continuationToken', async () => {
        // Arrange - Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect((result.body as UserListResponse).result).toHaveLength(50)
        expect((result.body as UserListResponse).next).not.toBe(null)

        // Arrange
        const token =
          (result.body as UserListResponse).next?.replace(
            /^\/api\/v1\/users\?token=(.+)&.+$/,
            '$1'
          ) ?? ''
        req.query = { token }

        // Act
        const nextResult = await getUserList(null, req)

        // Assert
        expect(nextResult.status).toBe(200)
        expect((nextResult.body as UserListResponse).result).toHaveLength(49)
        expect((nextResult.body as UserListResponse).next).toBe(null)
      })

      test.each([
        [{ area: '13' }, [users[13], users[63]]],
        [{ code: '10000010' }, [users[10]]],
        [
          { name: 'User 1' },
          [users[1], ...users.filter((_, i) => i >= 10 && i < 20)],
        ],
        [{ name: 'User 2', code: '10000023' }, [users[23]]],
      ])('%p returns %p', async (query, expectedUser) => {
        // Arrange
        req.query = query
        const expected = expectedUser.map<User>(u => ({
          id: u.id,
          name: u.name,
          area: u.area,
          code: u.code,
        }))

        // Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect((result.body as UserListResponse).result).toStrictEqual(expected)
        expect((result.body as UserListResponse).next).toBe(null)
      })

      test.each<{ [key: string]: string }>([
        { area: '53' },
        { code: '20000000' },
        { name: 'User 200' },
        { name: 'User 23', code: '10000024' },
      ])('%p returns []', async query => {
        // Arrange
        req.query = { ...query }

        // Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect((result.body as UserListResponse).result).toHaveLength(0)
      })

      afterAll(async () => {
        for (const user of users) {
          await getContainer('Users').item(user.id, user.id).delete()
        }
      })
    }
  )
})
