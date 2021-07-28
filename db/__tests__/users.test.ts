import type { Database } from '@ddradar/core'
import { publicUser } from '@ddradar/core/__tests__/data'
import { mocked } from 'ts-jest/utils'

import { fetchList, fetchOne } from '../database'
import { fetchLoginUser, fetchUser, fetchUserList } from '../users'

jest.mock('../database')

describe('users.ts', () => {
  describe('fetchUser', () => {
    beforeEach(() => mocked(fetchOne).mockClear())

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource: Database.UserSchema = { ...publicUser }
      delete resource.password
      mocked(fetchOne).mockResolvedValue(resource)

      // Act
      const result = await fetchUser(resource.id)

      // Assert
      expect(result).toBe(resource)
      expect(mocked(fetchOne)).toBeCalledWith(
        'Users',
        ['id', 'loginId', 'name', 'area', 'code', 'isPublic'],
        { condition: 'c.id = @', value: resource.id }
      )
    })
  })

  describe('fetchLoginUser', () => {
    beforeEach(() => mocked(fetchOne).mockClear())

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource = { ...publicUser }
      mocked(fetchOne).mockResolvedValue(resource)

      // Act
      const result = await fetchLoginUser(resource.loginId)

      // Assert
      expect(result).toBe(resource)
      expect(mocked(fetchOne)).toBeCalledWith(
        'Users',
        ['id', 'loginId', 'name', 'area', 'code', 'isPublic', 'password'],
        { condition: 'c.loginId = @', value: resource.loginId }
      )
    })
  })

  describe('fetchUserList', () => {
    beforeEach(() => {
      mocked(fetchList).mockClear()
      mocked(fetchList).mockResolvedValue([])
    })

    test.each([
      [undefined, undefined, undefined, []],
      [0, undefined, undefined, [{ condition: 'c.area = @', value: 0 }]],
      [0, '', 0, [{ condition: 'c.area = @', value: 0 }]],
      [
        undefined,
        'foo',
        undefined,
        [{ condition: 'CONTAINS(c.name, @, true)', value: 'foo' }],
      ],
      [
        undefined,
        undefined,
        10000000,
        [{ condition: 'c.code = @', value: 10000000 }],
      ],
    ] as const)(
      '("loginId", %p, %p, %p) calls fetchList("Users", columns, %p, {name: "ASC"})',
      async (area, name, code, cond) => {
        // Arrange - Act
        const result = await fetchUserList('loginId', area, name, code)

        // Assert
        expect(result).toHaveLength(0)
        expect(mocked(fetchList)).toBeCalledWith(
          'Users',
          ['id', 'name', 'area', 'code'],
          [
            {
              condition: '(c.isPublic = true OR c.loginId = @)',
              value: 'loginId',
            },
            ...cond,
            { condition: 'IS_DEFINED(c.loginId)' },
          ],
          { name: 'ASC' }
        )
      }
    )
  })
})
