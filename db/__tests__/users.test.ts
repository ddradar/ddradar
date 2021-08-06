import type { Database } from '@ddradar/core'
import { publicUser } from '@ddradar/core/__tests__/data'
import { mocked } from 'ts-jest/utils'

import { fetchOne } from '../database'
import { fetchLoginUser, fetchUser } from '../users'

jest.mock('../database')

describe('users.ts', () => {
  describe('fetchUser', () => {
    beforeEach(() => mocked(fetchOne).mockClear())

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource: Database.UserSchema = { ...publicUser }
      delete resource.password
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mocked(fetchOne).mockResolvedValue(resource as any)

      // Act
      const result = await fetchUser(resource.id)

      // Assert
      expect(result).toBe(resource)
      expect(mocked(fetchOne).mock.calls[0][2]).toStrictEqual({
        condition: 'c.id = @',
        value: resource.id,
      })
    })
  })

  describe('fetchLoginUser', () => {
    beforeEach(() => mocked(fetchOne).mockClear())

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource = { ...publicUser }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mocked(fetchOne).mockResolvedValue(resource as any)

      // Act
      const result = await fetchLoginUser(resource.loginId)

      // Assert
      expect(result).toBe(resource)
      expect(mocked(fetchOne).mock.calls[0][2]).toStrictEqual({
        condition: 'c.loginId = @',
        value: resource.loginId,
      })
    })
  })
})
