// oxlint-disable typescript/unbound-method - to mock db methods
import { db } from '@nuxthub/db'
import { scores } from '@nuxthub/db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import handler from '#server/api/me//scores/[songId]/[playStyle]/[difficulty].delete'
import { Difficulty, PlayStyle } from '#shared/schemas/step-chart'
import { testSongData } from '~~/test/data/song'
import { publicUser, sessionUser } from '~~/test/data/user'
import { createRequestEvent } from '~~/test/unit/util'

describe('DELETE /api/me/scores/[songId]/[playStyle]/[difficulty]', () => {
  const params = {
    songId: testSongData.id,
    playStyle: `${PlayStyle.SINGLE}`,
    difficulty: `${Difficulty.BASIC}`,
  }
  // Mocks for db.update().set().where().run()
  const run = vi.fn<() => Promise<{ meta: { changes: number } }>>()
  const where = vi.fn<() => void>(() => ({ run }))
  const set = vi.fn<() => void>(() => ({ where }))

  beforeAll(() => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: publicUser.id,
      roles: sessionUser.roles,
    })
    vi.mocked(db.update).mockReturnValue({ set } as never)
  })

  afterAll(() => {
    vi.mocked(requireAuthenticatedUser).mockReset()
  })

  test.each([
    ['', params.playStyle, params.difficulty],
    [params.songId, '4', params.difficulty],
    [params.songId, params.playStyle, '5'],
  ])(
    '(songId: "%s", playStyle: "%s", difficulty: "%s") returns 400 when parameters are invalid',
    async (songId, playStyle, difficulty) => {
      // Arrange
      const event = createRequestEvent(null, { songId, playStyle, difficulty })

      // Act - Assert
      await expect(handler(event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 400 })
      )
      expect(db.update).not.toHaveBeenCalled()
    }
  )

  test('returns 404 when score does not exist', async () => {
    // Arrange
    run.mockResolvedValue({ meta: { changes: 0 } })
    const event = createRequestEvent(null, params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(db.update).toHaveBeenCalledWith(scores)
    expect(set).toHaveBeenCalledWith({
      deletedAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
      updatedBy: publicUser.id,
    })
    expect(where).toHaveBeenCalledWith(
      and(
        eq(scores.userId, publicUser.id),
        eq(scores.songId, params.songId),
        eq(scores.playStyle, Number(params.playStyle)),
        eq(scores.difficulty, Number(params.difficulty)),
        isNull(scores.deletedAt)
      )
    )
    expect(run).toHaveBeenCalled()
  })

  test('returns 204 when score is deleted successfully', async () => {
    // Arrange
    run.mockResolvedValue({ meta: { changes: 1 } })
    const event = createRequestEvent(null, params)

    // Act
    await handler(event)

    // Assert
    expect(db.update).toHaveBeenCalledWith(scores)
    expect(set).toHaveBeenCalledWith({
      deletedAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
      updatedBy: publicUser.id,
    })
    expect(where).toHaveBeenCalledWith(
      and(
        eq(scores.userId, publicUser.id),
        eq(scores.songId, params.songId),
        eq(scores.playStyle, Number(params.playStyle)),
        eq(scores.difficulty, Number(params.difficulty)),
        isNull(scores.deletedAt)
      )
    )
    expect(run).toHaveBeenCalled()
  })
})
