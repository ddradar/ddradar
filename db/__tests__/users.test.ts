import type { UserSchema } from '@ddradar/db-definitions'
import { publicUser } from '@ddradar/db-definitions/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { fetchOne } from '../src/database'
import { fetchLoginUser, fetchUser } from '../src/users'

vi.mock('../src/database')

describe('users.ts', () => {
  describe('fetchUser', () => {
    beforeEach(() => {
      vi.mocked(fetchOne).mockClear()
    })

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource: UserSchema = { ...publicUser }
      delete resource.password
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchOne).mockResolvedValue(resource as any)

      // Act
      const result = await fetchUser(resource.id)

      // Assert
      expect(result).toBe(resource)
      expect(vi.mocked(fetchOne).mock.calls[0][2]).toStrictEqual({
        condition: 'c.id = @',
        value: resource.id,
      })
    })
  })

  describe('fetchLoginUser', () => {
    beforeEach(() => {
      vi.mocked(fetchOne).mockClear()
    })

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource = { ...publicUser }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchOne).mockResolvedValue(resource as any)

      // Act
      const result = await fetchLoginUser(resource.loginId)

      // Assert
      expect(result).toBe(resource)
      expect(vi.mocked(fetchOne).mock.calls[0][2]).toStrictEqual({
        condition: 'c.loginId = @',
        value: resource.loginId,
      })
    })
  })
})
