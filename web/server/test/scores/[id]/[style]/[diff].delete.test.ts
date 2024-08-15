// @vitest-environment node
import { publicUser as user, testScores } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/scores/[id]/[style]/[diff].delete'
import { createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

describe('DELETE /api/v2/scores/[id]/[style]/[diff]', () => {
  beforeEach(() => {
    vi.mocked(getScoreRepository).mockClear()
  })
  const params = {
    id: testScores[0].songId,
    style: `${testScores[0].playStyle}`,
    diff: `${testScores[0].difficulty}`,
  }

  test.each([
    { id: '', style: '', diff: '' },
    { ...params, id: '0' },
    { ...params, style: '3' },
    { ...params, diff: '-1' },
  ])('%o throws 400 error', async params => {
    // Arrange
    const event = createEvent(params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
  })

  test('throws 401 when anonymous', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockRejectedValue({ statusCode: 401 })
    const event = createEvent(params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 401 })
    )
    expect(vi.mocked(getScoreRepository)).not.toBeCalled()
  })

  test('returns 204 and calls ScoreRepository.delete()', async () => {
    // Arrange
    const deleteMock = vi.fn()
    vi.mocked(getLoginUserInfo).mockResolvedValue(user)
    vi.mocked(getScoreRepository).mockReturnValue({
      delete: deleteMock,
    } as unknown as ReturnType<typeof getScoreRepository>)
    const event = createEvent(params)

    // Act
    await handler(event)

    // Assert
    expect(deleteMock).toBeCalledWith(
      user.id,
      params.id,
      testScores[0].playStyle,
      testScores[0].difficulty
    )
  })
})
