import { canConnectDB, getContainer } from '../../db'
import {
  AreaCode,
  fetchLoginUser,
  fetchUser,
  fetchUserList,
  isUserSchema,
  UserSchema,
} from '../../db/users'
import { describeIf } from '../util'

describe('./db/users.ts', () => {
  describe('isUserSchema', () => {
    const validUserInfo: UserSchema = {
      id: 'new_user',
      name: 'New User',
      area: 13,
      isPublic: true,
    }
    test.each([
      undefined,
      null,
      true,
      1,
      'foo',
      {},
      { ...validUserInfo, id: 1 },
      { ...validUserInfo, id: '#foo' },
      { ...validUserInfo, area: 'Tokyo' },
      { ...validUserInfo, area: -1 },
      { ...validUserInfo, code: '1000-0000' },
      { ...validUserInfo, code: -1 },
      { ...validUserInfo, code: 100000000 },
      { ...validUserInfo, isPublic: undefined },
      { id: 'new_user', name: 'New User', area: 13 },
    ])('(%p) returns false', obj => {
      expect(isUserSchema(obj)).toBe(false)
    })
    test.each([
      validUserInfo,
      { ...validUserInfo, area: 0 },
      { ...validUserInfo, code: 10000000 },
      { ...validUserInfo, isPublic: false },
      { ...validUserInfo, loginId: 'foo' },
    ])('(%p) returns true', obj => {
      expect(isUserSchema(obj)).toBe(true)
    })
  })
  describeIf(canConnectDB)('Cosmos DB integration test', () => {
    const users: Required<UserSchema>[] = [...Array(100).keys()].map(i => ({
      id: `user_${i}`,
      loginId: `login_${i}`,
      name: `User ${i}`,
      area: (i % 50) as AreaCode,
      isPublic: i !== 0,
      code: 10000000 + i,
    }))
    /** System users */
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
    afterAll(async () => {
      await Promise.all(
        users.map(u => getContainer('Users').item(u.id, u.id).delete())
      )
      await Promise.all(
        areas.map(u => getContainer('Users').item(u.id, u.id).delete())
      )
    })

    describe('fetchUser', () => {
      test.each(['', 'foo', users[0].loginId, users[1].loginId])(
        '("%s") returns null',
        async id => {
          // Arrange - Act
          const user = await fetchUser(id)

          // Assert
          expect(user).toBeNull()
        }
      )

      test.each([
        [users[0].id, users[0]],
        [users[1].id, users[1]],
      ])('("%s") returns %p', async (id, expected) => {
        // Arrange - Act
        const user = await fetchUser(id)

        // Assert
        expect(user).toStrictEqual(expected)
      })
    })

    describe('fetchLoginUser', () => {
      test.each(['', 'foo', users[0].id, users[1].id])(
        '("%s") returns null',
        async loginId => {
          // Arrange - Act
          const user = await fetchLoginUser(loginId)

          // Assert
          expect(user).toBeNull()
        }
      )

      test.each([
        [users[0].loginId, users[0]],
        [users[1].loginId, users[1]],
      ])('("%s") returns %p', async (loginId, expected) => {
        // Arrange - Act
        const user = await fetchLoginUser(loginId)

        // Assert
        expect(user).toStrictEqual(expected)
      })
    })

    describe('fetchUserList', () => {
      test('("", undefined, "0") returns 9 users', async () => {
        // Arrange - Act
        const result = await fetchUserList('', undefined, '0')

        // Assert
        expect(result).toHaveLength(9)
      })

      test(`("${users[0].loginId}", undefined, "0") returns 10 users`, async () => {
        // Arrange - Act
        const result = await fetchUserList(users[0].loginId, undefined, '0')

        // Assert
        expect(result).toHaveLength(10)
      })

      test(`("", 13) returns 1 user`, async () => {
        // Arrange - Act
        const result = await fetchUserList('', 13)

        // Assert
        expect(result).toHaveLength(2)
      })

      test.each([
        [
          undefined,
          10000010,
          {
            id: users[10].id,
            name: users[10].name,
            area: users[10].area,
            code: users[10].code,
          },
        ],
        [
          'User 2',
          10000023,
          {
            id: users[23].id,
            name: users[23].name,
            area: users[23].area,
            code: users[23].code,
          },
        ],
      ])(
        '("", undefined, "%s", %i) returns [%p]',
        async (name, code, expected) => {
          // Arrange - Act
          const result = await fetchUserList('', undefined, name, code)

          // Assert
          expect(result).toHaveLength(1)
          expect(result[0]).toStrictEqual(expected)
        }
      )
    })
  })
})
