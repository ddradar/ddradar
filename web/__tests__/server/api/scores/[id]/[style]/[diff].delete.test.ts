import { publicUser as user, testScores } from '@ddradar/core/__tests__/data'
import { fetchList, getContainer } from '@ddradar/db'
import { createError, sendError } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import deleteChartScore from '~/server/api/v1/scores/[id]/[style]/[diff].delete'
import { getLoginUserInfo } from '~/server/auth'

vi.mock('@ddradar/db')
vi.mock('~/server/auth')
vi.mock('h3')

describe('DELETE /api/v1/scores/{id}/{style}/{diff}', () => {
  const mockedContainer = { item: vi.fn() }
  const mockedItem = { patch: vi.fn() }
  beforeAll(() => {
    vi.mocked(fetchList).mockResolvedValue([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
    vi.mocked(mockedContainer.item).mockReturnValue(mockedItem)
  })
  beforeEach(() => {
    mockedItem.patch.mockClear()
    vi.mocked(createError).mockClear()
    vi.mocked(sendError).mockClear()
    vi.mocked(fetchList).mockClear()
  })
  const score = testScores[0]
  const params = {
    id: score.songId,
    style: `${score.playStyle}`,
    diff: `${score.difficulty}`,
  }
  const dbScores = [{ id: score.userId, userId: score.userId }]

  test.each([
    { id: '', style: '', diff: '' },
    { ...params, id: '0' },
    { ...params, style: '3' },
    { ...params, diff: '-1' },
  ])('%o returns "404 Not Found"', async params => {
    // Arrange
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({ statusCode: 404 })
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns "401 Unauthorized" if anonymous', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({ statusCode: 401 })
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns "404 Not Found" if no score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({ statusCode: 404 })
    expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
      { condition: 'c.songId = @', value: score.songId },
      { condition: 'c.playStyle = @', value: score.playStyle },
      { condition: 'c.difficulty = @', value: score.difficulty },
      { condition: 'c.userId = @', value: user.id },
    ])
  })

  test('returns "204 No Content" and calls item.patch()', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendError)).not.toBeCalled()
    expect(vi.mocked(createError)).not.toBeCalled()
    expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
      { condition: 'c.songId = @', value: score.songId },
      { condition: 'c.playStyle = @', value: score.playStyle },
      { condition: 'c.difficulty = @', value: score.difficulty },
      { condition: 'c.userId = @', value: user.id },
    ])
    expect(mockedContainer.item).toBeCalledWith(score.userId, score.userId)
    expect(mockedItem.patch).toBeCalledWith([
      { op: 'add', path: '/ttl', value: 3600 },
    ])
  })
})
