// @vitest-environment node
import { privateUser, testScores } from '@ddradar/core/test/data'
import { fetchScoreList } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v1/users/[id]/scores.get'
import { createEvent } from '~~/server/test/utils'
import { tryFetchUser } from '~~/server/utils/auth'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/auth')

describe('GET /api/v1/users/[id]/scores', () => {
  beforeEach(() => {
    vi.mocked(fetchScoreList).mockClear()
  })

  test(`returns 404 if tryFetchUser() returns null`, async () => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    vi.mocked(tryFetchUser).mockResolvedValue(null)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(fetchScoreList)).not.toBeCalled()
  })

  test.each([
    [
      '1',
      '1',
      '5',
      'AAA',
      '5',
      { playStyle: 1, difficulty: 1, level: 5, rank: 'AAA', clearLamp: 5 },
    ],
    ['3', '-1', '21', 'PFC', 'F', {}],
  ])(
    `?style=%s&diff=%s&level=%s&rank=%s&lamp=%s calls fetchScoreList(..., %o)`,
    async (style, diff, level, rank, lamp, condition) => {
      // Arrange
      const event = createEvent(
        { id: privateUser.id },
        { style, diff, level, rank, lamp }
      )
      vi.mocked(tryFetchUser).mockResolvedValue(privateUser)
      vi.mocked(fetchScoreList).mockResolvedValue([...testScores])

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toHaveLength(testScores.length)
      expect(vi.mocked(fetchScoreList)).toBeCalledWith(
        privateUser.id,
        condition
      )
    }
  )
})
