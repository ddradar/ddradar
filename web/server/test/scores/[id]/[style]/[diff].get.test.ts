// @vitest-environment node
import { publicUser as user, testScores } from '@ddradar/core/test/data'
import { fetchList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v1/scores/[id]/[style]/[diff].get'
import { createEvent } from '~~/server/test/utils'
import { getLoginUserInfo } from '~~/server/utils/auth'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/auth')

describe('GET /api/v1/scores/[id]/[style]/[diff]', () => {
  const id = testScores[0].songId
  const params = {
    id,
    style: `${testScores[0].playStyle}`,
    diff: `${testScores[0].difficulty}`,
  }

  beforeAll(() => {
    vi.mocked(fetchList).mockResolvedValue([])
  })
  beforeEach(() => {
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
  ])('(%o) returns 400', async params => {
    // Arrange
    const event = createEvent(params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
  })

  test(`?scope=private returns 404 if anonymous`, async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    const event = createEvent(params, { scope: 'private' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      createError({
        statusCode: 404,
        message: '"private" scope must be logged in',
      })
    )
    expect(vi.mocked(fetchList)).not.toBeCalled()
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue(dbScores as any)
      const event = createEvent(params, { scope })

      // Act
      const scores = await handler(event)

      // Assert
      expect(scores).toBe(dbScores)
      expect(vi.mocked(fetchList).mock.lastCall?.[2][4]).toStrictEqual({
        condition,
        value,
      })
    }
  )
})
