// @vitest-environment node
import { fetchOne } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import getRoles from '~~/server/api/v1/user/roles.get'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')

describe('GET /api/v1/user/roles', () => {
  beforeEach(() => {
    vi.mocked(fetchOne).mockClear()
  })

  test.each([false, undefined])(
    'returns empty roles if user.isAdmin is %o',
    async isAdmin => {
      // Arrange
      const event = createEvent(undefined, undefined, { userId: '' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchOne).mockResolvedValueOnce({ isAdmin } as any)

      // Act
      const { roles } = await getRoles(event)

      // Assert
      expect(roles).toHaveLength(0)
      expect(vi.mocked(fetchOne)).toBeCalled()
    }
  )

  test('returns "administrator" roles if user.isAdmin is true', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, { userId: '' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValueOnce({ isAdmin: true } as any)

    // Act
    const { roles } = await getRoles(event)

    // Assert
    expect(roles).toStrictEqual(['administrator'])
    expect(vi.mocked(fetchOne)).toBeCalled()
  })
})
