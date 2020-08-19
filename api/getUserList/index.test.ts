import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import type { UserSchema } from '../db'
import { AreaCode } from '../db/users'
import getUserList from '.'

jest.mock('../auth')

describe('GET /api/v1/users', () => {
  let req: Pick<HttpRequest, 'headers' | 'query'>

  beforeEach(() => {
    req = { headers: {}, query: {} }
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const users: Required<UserSchema>[] = [...Array(100).keys()].map(i => ({
        id: `user_${i}`,
        loginId: `${i}`,
        name: `User ${i}`,
        area: (i % 50) as AreaCode,
        isPublic: i !== 0,
        code: 10000000 + i,
      }))
      const areas: UserSchema[] = [...Array(50).keys()].map(i => ({
        id: `${i}`,
        name: `User ${i}`,
        area: (i % 50) as AreaCode,
        isPublic: true,
      }))

      beforeAll(async () => {
        await Promise.all(users.map(u => getContainer('Users').items.create(u)))
        await Promise.all(areas.map(u => getContainer('Users').items.create(u)))
      })

      test('returns users without private user', async () => {
        // Arrange
        req.query = { name: '0' }

        // Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toHaveLength(9)
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
        expect(result.body).toHaveLength(10)
      })

      test.each([
        [
          { code: '10000010' },
          {
            id: users[10].id,
            name: users[10].name,
            area: users[10].area,
            code: users[10].code,
          },
        ],
        [
          { name: 'User 2', code: '10000023' },
          {
            id: users[23].id,
            name: users[23].name,
            area: users[23].area,
            code: users[23].code,
          },
        ],
      ])('%p returns [%p]', async (query, expected) => {
        // Arrange
        req.query = query

        // Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toHaveLength(1)
        expect(result.body[0]).toStrictEqual(expected)
      })

      test.each([
        [{ area: '13' }, 2],
        [{ name: 'User 1' }, 11],
      ])('%p returns %i users', async (query, count) => {
        // Arrange
        req.query = query

        // Act
        const result = await getUserList(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toHaveLength(count)
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
        expect(result.body).toHaveLength(0)
      })

      afterAll(async () => {
        await Promise.all(
          users.map(u => getContainer('Users').item(u.id, u.id).delete())
        )
        await Promise.all(
          areas.map(u => getContainer('Users').item(u.id, u.id).delete())
        )
      })
    }
  )
})
