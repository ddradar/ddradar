// @vitest-environment node
import { publicUser } from '@ddradar/core/test/data'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/users/index.get'
import { createClientPrincipal, createEvent } from '~~/server/test/utils'

describe('GET /api/v2/users', () => {
  const list = vi.fn()
  beforeAll(() => {
    list.mockResolvedValue([
      {
        id: publicUser.id,
        name: publicUser.name,
        area: publicUser.area,
        code: publicUser.code,
      },
    ])
  })
  beforeEach(() => {
    vi.mocked(list).mockClear()
  })

  test.each([
    ['', '', '', []],
    ['foo', '', '', [{ condition: 'CONTAINS(c.name, @, true)', value: 'foo' }]],
    ['', '13', '', [{ condition: 'c.area = @', value: 13 }]],
    ['', '', '10000000', [{ condition: 'c.code = @', value: 10000000 }]],
  ])(
    '?name=%s&area=%s&code=%s calls UserRepository.list(%o, undefined) when anonymous',
    async (name, area, code, conditions) => {
      // Arrange
      vi.mocked(getClientPrincipal).mockReturnValue(null)
      vi.mocked(getUserRepository).mockReturnValue({
        list,
      } as unknown as ReturnType<typeof getUserRepository>)
      const event = createEvent(undefined, { name, area, code })

      // Act
      const users = await handler(event)

      // Assert
      expect(users).toHaveLength(1)
      expect(list).toBeCalledWith(conditions, undefined)
    }
  )

  test('calls UserRepository.list([], loginId) when logged in', async () => {
    // Arrange
    vi.mocked(getClientPrincipal).mockReturnValue(
      createClientPrincipal(publicUser.id, 'loginId')
    )
    vi.mocked(getUserRepository).mockReturnValue({
      list,
    } as unknown as ReturnType<typeof getUserRepository>)
    const event = createEvent(undefined, undefined, {})

    // Act
    const users = await handler(event)

    // Assert
    expect(users).toHaveLength(1)
    expect(list).toBeCalledWith([], 'loginId')
  })
})
