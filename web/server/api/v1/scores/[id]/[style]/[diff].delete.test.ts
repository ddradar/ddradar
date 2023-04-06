import { publicUser as user, testScores } from '@ddradar/core/test/data'
import { fetchList, getContainer } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import deleteChartScore from '~~/server/api/v1/scores/[id]/[style]/[diff].delete'
import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')

describe('DELETE /api/v1/scores/[id]/[style]/[diff]', () => {
  const mockedContainer = { items: { batch: vi.fn() } }
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
    vi.mocked(fetchList).mockResolvedValue([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchList).mockClear()
    mockedContainer.items.batch.mockClear()
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
  ])('%o returns 404', async params => {
    // Arrange
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(getLoginUserInfo)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns 401 if anonymous', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 401)
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns 404 if no score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    vi.mocked(fetchList).mockResolvedValue([])
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
      { condition: 'c.songId = @', value: score.songId },
      { condition: 'c.playStyle = @', value: score.playStyle },
      { condition: 'c.difficulty = @', value: score.difficulty },
      { condition: 'c.userId = @', value: user.id },
    ])
    expect(mockedContainer.items.batch).not.toBeCalled()
  })

  test('returns 204 and calls item.batch(<Patch Operations>)', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(dbScores as any)
    const event = createEvent(params)

    // Act
    await deleteChartScore(event)

    // Assert
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(vi.mocked(fetchList).mock.lastCall?.[2]).toStrictEqual([
      { condition: 'c.songId = @', value: score.songId },
      { condition: 'c.playStyle = @', value: score.playStyle },
      { condition: 'c.difficulty = @', value: score.difficulty },
      { condition: 'c.userId = @', value: user.id },
    ])
    expect(mockedContainer.items.batch).toBeCalledWith([
      {
        operationType: 'Patch',
        id: score.userId,
        partitionKey: score.userId,
        resourceBody: {
          operations: [{ op: 'add', path: '/ttl', value: 3600 }],
        },
      },
    ])
  })
})
