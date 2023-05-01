// @vitest-environment node
import { publicUser as user, testScores } from '@ddradar/core/test/data'
import { fetchList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import fetchChartScores from '~~/server/api/v1/scores/[id]/[style]/[diff].get'
import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { createEvent } from '~~/test/test-utils-server'
import { getQueryString } from '~~/utils/path'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')
vi.mock('~~/utils/path')

describe('GET /api/v1/scores/[id]/[style]/[diff]', () => {
  const id = testScores[0].songId
  const params = {
    id,
    style: `${testScores[0].playStyle}`,
    diff: `${testScores[0].difficulty}`,
  }

  beforeAll(() => {
    vi.mocked(fetchList).mockResolvedValue([])
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchList).mockClear()
  })

  const dbScores = testScores.map(s => ({
    userId: s.userId,
    userName: s.userName,
    songId: s.songId,
    songName: s.songName,
    playStyle: s.playStyle,
    difficulty: s.difficulty,
    level: s.level,
    score: s.score,
    clearLamp: s.clearLamp,
    rank: s.rank,
    ...(s.maxCombo !== undefined ? { maxCombo: s.maxCombo } : {}),
    ...(s.exScore !== undefined ? { exScore: s.exScore } : {}),
  }))

  test.each([
    { id: '', style: '', diff: '' },
    { ...params, id: '0' },
    { ...params, style: '3' },
    { ...params, diff: '-1' },
  ])('(%o) returns 404', async params => {
    // Arrange
    const event = createEvent(params)

    // Act
    const scores = await fetchChartScores(event)

    // Assert
    expect(scores).toHaveLength(0)
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test(`?scope=private returns 404 if anonymous`, async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    vi.mocked(getQueryString).mockReturnValue('private')
    const event = createEvent(params)

    // Act
    const scores = await fetchChartScores(event)

    // Assert
    expect(scores).toHaveLength(0)
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns 404 if no score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    vi.mocked(getQueryString).mockReturnValue(undefined)
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent(params)

    // Act
    const scores = await fetchChartScores(event)

    // Assert
    expect(scores).toHaveLength(0)
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
      { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
      { condition: 'c.songId = @', value: testScores[0].songId },
      { condition: 'c.playStyle = @', value: testScores[0].playStyle },
      { condition: 'c.difficulty = @', value: testScores[0].difficulty },
      { condition: '(ARRAY_CONTAINS(@, c.userId))', value: ['0'] },
    ])
  })

  test.each([
    ['medium', null, '(ARRAY_CONTAINS(@, c.userId))', ['0']],
    ['invalid', null, '(ARRAY_CONTAINS(@, c.userId))', ['0']],
    ['full', null, '(ARRAY_CONTAINS(@, c.userId) OR c.isPublic)', ['0']],
    ['private', user, '(ARRAY_CONTAINS(@, c.userId))', [user.id]],
    [
      'medium',
      user,
      '(ARRAY_CONTAINS(@, c.userId))',
      [user.id, '0', `${user.area}`],
    ],
    [
      'full',
      user,
      '(ARRAY_CONTAINS(@, c.userId) OR c.isPublic)',
      [user.id, '0', `${user.area}`],
    ],
  ])(
    '?scope=%s (user: %o) returns 200 with Scores',
    async (scope, user, condition, value) => {
      // Arrange
      vi.mocked(getLoginUserInfo).mockResolvedValue(user)
      vi.mocked(getQueryString).mockReturnValue(scope)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue(dbScores as any)
      const event = createEvent(params)

      // Act
      const scores = await fetchChartScores(event)

      // Assert
      expect(scores).toBe(dbScores)
      expect(vi.mocked(sendNullWithError)).not.toBeCalled()
      expect(vi.mocked(fetchList).mock.lastCall?.[2][4]).toStrictEqual({
        condition,
        value,
      })
    }
  )
})