import { publicUser } from '@ddradar/core/__tests__/data'
import { fetchList } from '@ddradar/db'
import { getQuery } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  createClientPrincipal,
  createEvent,
} from '~/__tests__/server/test-util'
import getUserList from '~/server/api/v1/users/index.get'
import { useClientPrincipal } from '~~/server/utils/auth'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~~/server/utils/auth')

describe('GET /api/v1/users', () => {
  beforeAll(() => {
    vi.mocked(fetchList).mockResolvedValue([
      {
        id: publicUser.id,
        name: publicUser.name,
        area: publicUser.area,
        code: publicUser.code,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    ])
  })
  beforeEach(() => {
    vi.mocked(fetchList).mockClear()
  })

  test.each([
    ['', '', '', []],
    ['foo', '', '', [{ condition: 'CONTAINS(c.name, @, true)', value: 'foo' }]],
    ['', '13', '', [{ condition: 'c.area = @', value: 13 }]],
    ['', '', '10000000', [{ condition: 'c.code = @', value: 10000000 }]],
  ])(
    '?name=%s&area=%s&code=%s calls fetchList(%o) (anonymous)',
    async (name, area, code, conditions) => {
      // Arrange
      vi.mocked(useClientPrincipal).mockReturnValue(null)
      vi.mocked(getQuery).mockReturnValue({ name, area, code })

      // Act
      const users = await getUserList(createEvent())

      // Assert
      expect(users).toHaveLength(1)
      expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
        { condition: '(c.isPublic OR c.loginId = @)', value: null },
        ...conditions,
      ])
    }
  )

  test('calls fetchList(%o) (login user)', async () => {
    // Arrange
    vi.mocked(useClientPrincipal).mockReturnValue(
      createClientPrincipal(publicUser.id, publicUser.loginId)
    )
    vi.mocked(getQuery).mockReturnValue({})

    // Act
    const users = await getUserList(createEvent())

    // Assert
    expect(users).toHaveLength(1)
    expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
      { condition: '(c.isPublic OR c.loginId = @)', value: publicUser.loginId },
    ])
  })
})
