import { Score } from '@ddradar/core'
import { privateUser } from '@ddradar/core/__tests__/data'
import { fetchList, fetchOne } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import type { RankStatus } from '~/server/api/v1/users/[id]/rank.get'
import getDanceLevels from '~/server/api/v1/users/[id]/rank.get'
import { canReadUserData } from '~/server/auth'
import { getQueryInteger, sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~/server/auth')
vi.mock('~/server/utils')

describe('GET /api/v1/users/[id]/clear', () => {
  const levelLimit = 19
  const totalCount = 2000
  const ranks: RankStatus[] = [
    ...Array(levelLimit * Score.danceLevelSet.size).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % levelLimit) + 1,
    rank: [...Score.danceLevelSet][n % Score.danceLevelSet.size],
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

  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchOne).mockClear()
    vi.mocked(fetchList).mockClear()
  })

  const invalidId = 'ユーザー'
  test(`(id: "${invalidId}") returns "404 Not Found"`, async () => {
    // Arrange
    const event = createEvent({ id: invalidId })

    // Act
    const result = await getDanceLevels(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test('(id: "not_exists_user") returns "404 Not Found"', async () => {
    // Arrange
    const event = createEvent({ id: 'not_exists_user' })
    vi.mocked(fetchOne).mockResolvedValue(null)

    // Act
    const result = await getDanceLevels(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test(`returns "404 Not Found" if canReadUserData() returns false`, async () => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(privateUser as any)
    vi.mocked(canReadUserData).mockReturnValue(false)

    // Act
    const result = await getDanceLevels(event)

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
  ])(`?style=%s&lv=%s returns "200 OK"`, async (style, lv, conditions) => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    vi.mocked(canReadUserData).mockReturnValue(true)
    vi.mocked(getQueryInteger).mockImplementation((_, key) =>
      key === 'style' ? parseFloat(style) : parseFloat(lv)
    )
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(fetchOne).mockResolvedValue(privateUser as any)
    vi.mocked(fetchList).mockImplementation((_1, col, _3, _4): any =>
      col.includes('rank') ? ranks : total
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const result = await getDanceLevels(event)

    // Assert
    expect(result).toHaveLength(
      levelLimit * (Score.danceLevelSet.size + /* SP/DP No play */ 2)
    )
    expect(sum(result as RankStatus[])).toBe(levelLimit * 2 * totalCount)
    expect(vi.mocked(fetchList).mock.calls[0][2]).toStrictEqual([
      { condition: 'c.userId = @', value: privateUser.id },
      { condition: 'c.type = "score"' },
      ...conditions,
    ])
    expect(vi.mocked(fetchList).mock.calls[1][2]).toStrictEqual([
      { condition: 'c.userId = "0"' },
      ...conditions,
    ])
  })
})
