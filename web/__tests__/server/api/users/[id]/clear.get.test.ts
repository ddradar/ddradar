import { Score } from '@ddradar/core'
import { privateUser } from '@ddradar/core/__tests__/data'
import { fetchList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import type { ClearStatus } from '~/server/api/v1/users/[id]/clear.get'
import getClearCount from '~/server/api/v1/users/[id]/clear.get'
import { tryFetchUser } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'
import { getQueryInteger } from '~/src/path'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~/server/auth')
vi.mock('~/server/utils')
vi.mock('~/src/path')

describe('GET /api/v1/users/[id]/clear', () => {
  const levelLimit = 19
  const totalCount = 2000
  const statuses: ClearStatus[] = [
    ...Array(levelLimit * Score.clearLampMap.size).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % levelLimit) + 1,
    clearLamp: (n % Score.clearLampMap.size) as Score.ClearLamp,
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

  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchList).mockClear()
  })

  test(`returns 404 if canReadUserData() returns null`, async () => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    vi.mocked(tryFetchUser).mockResolvedValue(null)

    // Act
    const result = await getClearCount(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
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
      const event = createEvent({ id: privateUser.id })
      vi.mocked(tryFetchUser).mockResolvedValue(privateUser)
      vi.mocked(getQueryInteger).mockImplementation((_, key) =>
        key === 'style' ? parseFloat(style) : parseFloat(lv)
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockImplementation((_1, col, _3, _4): any =>
        col.includes('clearLamp') ? statuses : total
      )

      // Act
      const result = await getClearCount(event)

      // Assert
      expect(result).toHaveLength(
        levelLimit * (Score.clearLampMap.size + /* SP/DP No play */ 2)
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
