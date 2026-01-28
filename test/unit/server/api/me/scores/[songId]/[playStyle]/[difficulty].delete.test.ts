import { db } from '@nuxthub/db'
import { scores } from '@nuxthub/db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import type { H3Event } from 'h3'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { Difficulty, PlayStyle } from '#shared/schemas/step-chart'
import handler from '~~/server/api/me//scores/[songId]/[playStyle]/[difficulty].delete'
import { testSongData } from '~~/test/data/song'
import { publicUser, sessionUser } from '~~/test/data/user'

describe('DELETE /api/me/scores/[songId]/[playStyle]/[difficulty]', () => {
  const params = {
    songId: testSongData.id,
    playStyle: `${PlayStyle.SINGLE}`,
    difficulty: `${Difficulty.BASIC}`,
  }
  // Mocks for db.update().set().where().run()
  const run = vi.fn()
  const where = vi.fn(() => ({ run }))
  const set = vi.fn(() => ({ where }))

  beforeAll(() => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: publicUser.id,
      roles: sessionUser.roles,
    })
    vi.mocked(db.update).mockReturnValue({ set } as never)
  })
  beforeEach(() => {
    vi.mocked(db.update).mockClear()
    set.mockClear()
    where.mockClear()
    run.mockClear()
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
      const event: Partial<H3Event> = {
        method: 'DELETE',
        context: { params: { songId, playStyle, difficulty } },
      }

      // Act - Assert
      await expect(handler(event as H3Event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 400 })
      )
      expect(db.update).not.toHaveBeenCalled()
    }
  )

  test('returns 404 when score does not exist', async () => {
    // Arrange
    run.mockResolvedValue({ meta: { changes: 0 } })
    const event: Partial<H3Event> = { method: 'DELETE', context: { params } }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(db.update).toHaveBeenCalledWith(scores)
    expect(set).toHaveBeenCalledWith({
      deletedAt: expect.any(Date),
      updatedAt: expect.any(Date),
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
    const event: Partial<H3Event> = {
      method: 'DELETE',
      context: { params },
      node: { res: {} } as never,
    }

    // Act
    await handler(event as H3Event)

    // Assert
    expect(db.update).toHaveBeenCalledWith(scores)
    expect(set).toHaveBeenCalledWith({
      deletedAt: expect.any(Date),
      updatedAt: expect.any(Date),
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
