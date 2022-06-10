import type { Database } from '@ddradar/core'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'

import { canConnectDB, getContainer } from '../database'
import { fetchLoginUser, fetchUser } from '../users'
import { describeIf } from './util'

describeIf(canConnectDB)('users.ts', () => {
  const users: Required<Database.UserSchema>[] = [...Array(5).keys()].map(
    i => ({
      id: `user_${i}`,
      loginId: `login_${i}`,
      name: `User ${i}`,
      area: (i % 50) as Database.AreaCode,
      isPublic: i !== 0,
      code: 10000000 + i,
      password: `pass_${i}`,
    })
  )
  /** System users */
  const areas: Database.UserSchema[] = [...Array(5).keys()].map(i => ({
    id: `${i}`,
    name: `User ${i}`,
    area: (i % 50) as Database.AreaCode,
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
      const result = await fetchUser(id)

      // Assert
      expect(result).toStrictEqual(expected)
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
})
