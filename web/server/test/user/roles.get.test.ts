// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/user/roles.get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/user/roles', () => {
  beforeEach(() => {
    vi.mocked(getUserRepository).mockClear()
  })

  test.each([
    [[], false],
    [['administrator'], true],
  ])(
    'returns { roles: %o } when UserRepository.isAdministrator() returns %o',
    async (expected, isAdmin) => {
      // Arrange
      const event = createEvent(undefined, undefined, { userId: 'userId' })
      const isAdministrator = vi.fn().mockResolvedValue(isAdmin)
      vi.mocked(getUserRepository).mockReturnValueOnce({
        isAdministrator,
      } as unknown as ReturnType<typeof getUserRepository>)

      // Act
      const { roles } = await handler(event)

      // Assert
      expect(roles).toStrictEqual(expected)
      expect(vi.mocked(getUserRepository)).toHaveBeenCalled()
      expect(isAdministrator).toHaveBeenCalledWith('userId')
    }
  )
})
