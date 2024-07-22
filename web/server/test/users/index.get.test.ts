// @vitest-environment node
import { publicUser } from '@ddradar/core/test/data'
import { fetchList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import getUserList from '~~/server/api/v1/users/index.get'
import { createClientPrincipal, createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

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
      vi.mocked(getClientPrincipal).mockReturnValue(null)
      const event = createEvent(undefined, { name, area, code })

      // Act
      const users = await getUserList(event)

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
    vi.mocked(getClientPrincipal).mockReturnValue(
      createClientPrincipal(publicUser.id, publicUser.loginId)
    )
    const event = createEvent(undefined, undefined, {})

    // Act
    const users = await getUserList(event)

    // Assert
    expect(users).toHaveLength(1)
    expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
      { condition: '(c.isPublic OR c.loginId = @)', value: publicUser.loginId },
    ])
  })
})
