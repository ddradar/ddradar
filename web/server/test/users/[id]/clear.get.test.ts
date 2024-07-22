// @vitest-environment node
import type { ClearLamp } from '@ddradar/core'
import { clearLampMap } from '@ddradar/core'
import { privateUser } from '@ddradar/core/test/data'
import { fetchList } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { ClearStatus } from '~~/schemas/user'
import handler from '~~/server/api/v1/users/[id]/clear.get'
import { createEvent } from '~~/server/test/utils'
import { tryFetchUser } from '~~/server/utils/auth'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/auth')

describe('GET /api/v1/users/[id]/clear', () => {
  const levelLimit = 19
  const totalCount = 2000
  const statuses: ClearStatus[] = [
    ...Array(levelLimit * clearLampMap.size).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % levelLimit) + 1,
    clearLamp: (n % clearLampMap.size) as ClearLamp,
    count: n,
  }))
  const total: Omit<ClearStatus, 'clearLamp'>[] = [
    ...Array(levelLimit * 2).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % levelLimit) + 1,
    count: totalCount,
  }))
  const sum = (scores: ClearStatus[]) => scores.reduce((p, c) => p + c.count, 0)

  beforeEach(() => {
    vi.mocked(fetchList).mockClear()
  })

  test(`returns 404 if tryFetchUser() returns null`, async () => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    vi.mocked(tryFetchUser).mockResolvedValue(null)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test.each([
    ['', '', []],
    ['1', '', [{ condition: 'c.playStyle = @', value: 1 }]],
    ['', '10', [{ condition: 'c.level = @', value: 10 }]],
    [
      '2',
      '1',
      [
        { condition: 'c.playStyle = @', value: 2 },
        { condition: 'c.level = @', value: 1 },
      ],
    ],
  ])(
    `?style=%s&lv=%s calls fetchList(..., ..., %o)`,
    async (style, lv, conditions) => {
      // Arrange
      const event = createEvent({ id: privateUser.id }, { style, lv })
      vi.mocked(tryFetchUser).mockResolvedValue(privateUser)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockImplementation((_1, col, _3, _4): any =>
        col.includes('clearLamp') ? statuses : total
      )

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toHaveLength(
        levelLimit * (clearLampMap.size + /* SP/DP No play */ 2)
      )
      expect(sum(result as ClearStatus[])).toBe(levelLimit * 2 * totalCount)
      expect(vi.mocked(fetchList).mock.calls[0][2]).toStrictEqual([
        { condition: 'c.userId = @', value: privateUser.id },
        { condition: 'c.type = "clear"' },
        ...conditions,
      ])
      expect(vi.mocked(fetchList).mock.calls[1][2]).toStrictEqual([
        { condition: 'c.userId = "0"' },
        ...conditions,
      ])
    }
  )
})
