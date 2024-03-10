// @vitest-environment node
import type { DanceLevel } from '@ddradar/core'
import { danceLevelSet } from '@ddradar/core'
import { fetchList } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { privateUser } from '~/../core/test/data'
import type { RankStatus } from '~/schemas/user'
import handler from '~/server/api/v1/users/[id]/rank.get'
import { tryFetchUser } from '~/server/utils/auth'
import { createEvent } from '~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('~/server/utils/auth')

describe('GET /api/v1/users/[id]/rank', () => {
  const levelLimit = 19
  const totalCount = 2000
  const ranks: RankStatus[] = [
    ...Array(levelLimit * danceLevelSet.size).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % levelLimit) + 1,
    rank: [...danceLevelSet][n % danceLevelSet.size] as DanceLevel,
    count: n,
  }))
  const total: Omit<RankStatus, 'rank'>[] = [
    ...Array(levelLimit * 2).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % levelLimit) + 1,
    count: totalCount,
  }))
  const sum = (scores: RankStatus[]) => scores.reduce((p, c) => p + c.count, 0)

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
        col.includes('rank') ? ranks : total
      )

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toHaveLength(
        levelLimit * (danceLevelSet.size + /* SP/DP No play */ 2)
      )
      expect(sum(result as RankStatus[])).toBe(levelLimit * 2 * totalCount)
      expect(vi.mocked(fetchList)).toBeCalledWith(
        'UserDetails',
        ['playStyle', 'level', 'rank', 'count'],
        [
          { condition: 'c.userId = @', value: privateUser.id },
          { condition: 'c.type = "score"' },
          ...conditions,
        ],
        { playStyle: 'ASC' }
      )
      expect(vi.mocked(fetchList)).toBeCalledWith(
        'UserDetails',
        ['playStyle', 'level', 'count'],
        [{ condition: 'c.userId = "0"' }, ...conditions],
        { playStyle: 'ASC' }
      )
    }
  )
})
