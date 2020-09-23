import { canConnectDB, getContainer } from '../../db'
import {
  fetchLoginUser,
  fetchUser,
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
    const users: UserSchema[] = [
      {
        id: 'public_user',
        loginId: 'user_1',
        name: 'User 1',
        area: 13,
        code: 10000000,
        isPublic: true,
      },
      {
        id: 'private_user',
        loginId: 'user_2',
        name: 'User 2',
        area: 0,
        isPublic: false,
      },
      { id: '0', name: '0', area: 0, isPublic: false },
    ]
    beforeAll(async () => {
      await Promise.all(users.map(u => getContainer('Users').items.create(u)))
    })
    afterAll(async () => {
      await Promise.all(
        users.map(u => getContainer('Users').item(u.id, u.area).delete())
      )
    })

    describe('fetchUser', () => {
      test.each([
        '',
        'foo',
        users[0].loginId as string,
        users[1].loginId as string,
      ])('("%s") returns null', async id => {
        // Arrange - Act
        const user = await fetchUser(id)

        // Assert
        expect(user).toBeNull()
      })

      test.each(
        users.map<[string, UserSchema]>(u => [u.id, u])
      )('("%s") returns %p', async (id, expected) => {
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
        [users[0].loginId as string, users[0]],
        [users[1].loginId as string, users[1]],
      ])('("%s") returns %p', async (loginId, expected) => {
        // Arrange - Act
        const user = await fetchLoginUser(loginId)

        // Assert
        expect(user).toStrictEqual(expected)
      })
    })
  })
})
