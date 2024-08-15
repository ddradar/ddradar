// @vitest-environment node
import type { User } from '@ddradar/core'
import { publicUser as user, testScores } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/scores/[id]/[style]/[diff].get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/scores/[id]/[style]/[diff]', () => {
  const { songId, playStyle, difficulty } = testScores[0]
  const params = {
    id: songId,
    style: `${playStyle}`,
    diff: `${difficulty}`,
  }

  beforeEach(() => {
    vi.mocked(getScoreRepository).mockClear()
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
  ])('(%o) throws 400 error', async params => {
    // Arrange
    const event = createEvent(params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
  })

  test(`?scope=private throws 404 error if anonymous`, async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockRejectedValue({ statusCode: 401 })
    const event = createEvent(params, { scope: 'private' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(vi.mocked(getScoreRepository)).not.toBeCalled()
  })

  test.each([
    [
      'medium',
      null,
      [
        { condition: 'c.song.id = @', value: songId },
        { condition: 'c.chart.playStyle = @', value: playStyle },
        { condition: 'c.chart.difficulty = @', value: difficulty },
        { condition: 'ARRAY_CONTAINS(@, c.user.id)', value: ['0'] },
      ],
    ],
    [
      'invalid',
      null,
      [
        { condition: 'c.song.id = @', value: songId },
        { condition: 'c.chart.playStyle = @', value: playStyle },
        { condition: 'c.chart.difficulty = @', value: difficulty },
        { condition: 'ARRAY_CONTAINS(@, c.user.id)', value: ['0'] },
      ],
    ],
    [
      'full',
      null,
      [
        { condition: 'c.song.id = @', value: songId },
        { condition: 'c.chart.playStyle = @', value: playStyle },
        { condition: 'c.chart.difficulty = @', value: difficulty },
        {
          condition: 'ARRAY_CONTAINS(@, c.user.id) OR c.user.isPublic',
          value: ['0'],
        },
      ],
    ],
    [
      'private',
      user,
      [
        { condition: 'c.song.id = @', value: songId },
        { condition: 'c.chart.playStyle = @', value: playStyle },
        { condition: 'c.chart.difficulty = @', value: difficulty },
        { condition: 'ARRAY_CONTAINS(@, c.user.id)', value: [user.id] },
      ],
    ],
    [
      'medium',
      user,
      [
        { condition: 'c.song.id = @', value: songId },
        { condition: 'c.chart.playStyle = @', value: playStyle },
        { condition: 'c.chart.difficulty = @', value: difficulty },
        {
          condition: 'ARRAY_CONTAINS(@, c.user.id)',
          value: [user.id, '0', `${user.area}`],
        },
      ],
    ],
    [
      'full',
      user,
      [
        { condition: 'c.song.id = @', value: songId },
        { condition: 'c.chart.playStyle = @', value: playStyle },
        { condition: 'c.chart.difficulty = @', value: difficulty },
        {
          condition: 'ARRAY_CONTAINS(@, c.user.id) OR c.user.isPublic',
          value: [user.id, '0', `${user.area}`],
        },
      ],
    ],
  ])(
    '?scope=%s (user: %o) returns 200 with Scores',
    async (scope, user, conditions) => {
      // Arrange
      vi.mocked(getLoginUserInfo).mockResolvedValue(user as User)
      const list = vi.fn().mockResolvedValue(dbScores)
      vi.mocked(getScoreRepository).mockReturnValue({
        list,
      } as unknown as ReturnType<typeof getScoreRepository>)
      const event = createEvent(params, { scope })

      // Act
      const scores = await handler(event)

      // Assert
      expect(scores).toBe(dbScores)
      expect(list).toBeCalledWith(conditions)
    }
  )
})
