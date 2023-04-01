import { privateUser, testScores } from '@ddradar/core/test/data'
import { fetchScoreList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import getUserScores from '~/server/api/v1/users/[id]/scores.get'
import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { getQueryInteger, getQueryString } from '~~/utils/path'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')
vi.mock('~~/utils/path')

describe('GET /api/v1/users/[id]/scores', () => {
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchScoreList).mockClear()
  })

  test(`returns 404 if canReadUserData() returns null`, async () => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    vi.mocked(tryFetchUser).mockResolvedValue(null)

    // Act
    const result = await getUserScores(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(fetchScoreList)).not.toBeCalled()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
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
      const event = createEvent({ id: privateUser.id })
      vi.mocked(tryFetchUser).mockResolvedValue(privateUser)
      vi.mocked(getQueryInteger).mockImplementation((_, key) =>
        key === 'style'
          ? parseFloat(style)
          : key === 'diff'
          ? parseFloat(diff)
          : key === 'level'
          ? parseFloat(level)
          : parseFloat(lamp)
      )
      vi.mocked(getQueryString).mockReturnValue(rank)
      vi.mocked(fetchScoreList).mockResolvedValue([...testScores])

      // Act
      const result = await getUserScores(event)

      // Assert
      expect(result).toHaveLength(testScores.length)
      expect(vi.mocked(fetchScoreList)).toBeCalledWith(
        privateUser.id,
        condition
      )
    }
  )
})
