import { db } from '@nuxthub/db'
import { scores, users } from '@nuxthub/db/schema'
import { and, eq, inArray, isNotNull, isNull, or, sql } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ClearLamp } from '#shared/schemas/score'
import { Difficulty, PlayStyle } from '#shared/schemas/step-chart'
import { range } from '#shared/utils'
import handler from '~~/server/api/songs/[id]/scores.get'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { privateUser } from '~~/test/data/user'

describe('GET /api/songs/[id]/scores', () => {
  const song = { ...testSongData, charts: [...testStepCharts] }
  const generateScores = (count: number): ScoreSearchResult[] =>
    [...Array(count)].map((_, i) => ({
      song: { id: song.id, name: song.name, artist: song.artist },
      chart: {
        playStyle: testStepCharts[0].playStyle,
        difficulty: testStepCharts[0].difficulty,
        level: testStepCharts[0].level,
      },
      user: { id: `user${i + 1}`, name: `User ${i + 1}`, area: i },
      normalScore: 1000000,
      exScore:
        (testStepCharts[0].notes +
          testStepCharts[0].freezes +
          testStepCharts[0].shocks) *
        3,
      maxCombo: testStepCharts[0].notes + testStepCharts[0].shocks,
      clearLamp: ClearLamp.MFC,
      rank: 'AAA',
      flareRank: 0,
      flareSkill: null,
      updatedAt: new Date(),
    }))
  beforeEach(() => {
    vi.mocked(db.query.scores.findMany).mockClear()
    vi.mocked(getAuthenticatedUser).mockClear()
    vi.mocked(getCachedSongInfo).mockClear()
  })

  test.each(['', 'invalid-id'])('(id : "%s") returns 400', async id => {
    // Arrange
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
    vi.mocked(getCachedSongInfo).mockResolvedValue(song)
    const event: Partial<H3Event> = { context: { params: { id } } }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getCachedSongInfo)).not.toHaveBeenCalled()
    expect(vi.mocked(db.query.scores.findMany)).not.toHaveBeenCalled()
  })

  test('returns 404 when song is not found', async () => {
    // Arrange
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
    vi.mocked(getCachedSongInfo).mockResolvedValue(undefined)
    const event: Partial<H3Event> = { context: { params: { id: song.id } } }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(vi.mocked(getCachedSongInfo)).toHaveBeenCalledWith(event, song.id)
    expect(vi.mocked(db.query.scores.findMany)).not.toHaveBeenCalled()
  })

  describe.each([
    [
      '',
      { limit: 50, offset: 0, nextOffset: null, hasMore: false },
      [
        inArray(scores.playStyle, [PlayStyle.SINGLE, PlayStyle.DOUBLE]),
        inArray(
          scores.difficulty,
          range(Difficulty.BEGINNER, Difficulty.CHALLENGE)
        ),
      ],
    ],
    [
      'style=1&diff=0',
      { limit: 50, offset: 0, nextOffset: null, hasMore: false },
      [
        inArray(scores.playStyle, [PlayStyle.SINGLE]),
        inArray(scores.difficulty, [Difficulty.BEGINNER]),
      ],
    ],
    [
      'limit=2&offset=1',
      { limit: 2, offset: 1, nextOffset: 3, hasMore: true },
      [
        inArray(scores.playStyle, [PlayStyle.SINGLE, PlayStyle.DOUBLE]),
        inArray(
          scores.difficulty,
          range(Difficulty.BEGINNER, Difficulty.CHALLENGE)
        ),
      ],
    ],
  ])(
    '(query: "%s") filters by expected conditions',
    (query, pagenation, conditions) => {
      test('without authentication', async () => {
        // Arrange
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
        vi.mocked(getCachedSongInfo).mockResolvedValue(song)
        const items = generateScores(5)
        vi.mocked(db.query.scores.findMany).mockResolvedValue(items as never)
        const pathSuffix = query ? `?${query}` : ''
        const event: Partial<H3Event> = {
          path: `/api/songs/${song.id}/scores${pathSuffix}`,
          context: { params: { id: song.id } },
        }

        // Act
        const result = await handler(event as H3Event)

        // Assert
        expect(result).toStrictEqual({
          items: items.slice(0, pagenation.limit),
          ...pagenation,
        })
        expect(vi.mocked(db.query.scores.findMany)).toHaveBeenCalledWith(
          expect.objectContaining({
            where: and(
              eq(scores.songId, song.id),
              ...conditions,
              isNotNull(sql`user`),
              isNull(scores.deletedAt)
            ),
            with: expect.objectContaining({
              user: {
                columns: { id: true, name: true, area: true },
                where: or(eq(users.isPublic, true), eq(users.id, '')),
              },
            }),
          })
        )
      })

      test('with authentication', async () => {
        // Arrange
        vi.mocked(getAuthenticatedUser).mockResolvedValue({
          id: privateUser.id,
          roles: [],
        })
        vi.mocked(getCachedSongInfo).mockResolvedValue(song)
        const items = generateScores(5)
        vi.mocked(db.query.scores.findMany).mockResolvedValue(items as never)
        const pathSuffix = query ? `?${query}` : ''
        const event: Partial<H3Event> = {
          path: `/api/songs/${song.id}/scores${pathSuffix}`,
          context: { params: { id: song.id } },
        }

        // Act
        const result = await handler(event as H3Event)

        // Assert
        expect(result).toStrictEqual({
          items: items.slice(0, pagenation.limit),
          ...pagenation,
        })
        expect(vi.mocked(db.query.scores.findMany)).toHaveBeenCalledWith(
          expect.objectContaining({
            where: and(
              eq(scores.songId, song.id),
              ...conditions,
              isNotNull(sql`user`),
              isNull(scores.deletedAt)
            ),
            with: expect.objectContaining({
              user: {
                columns: { id: true, name: true, area: true },
                where: or(
                  eq(users.isPublic, true),
                  eq(users.id, privateUser.id)
                ),
              },
            }),
          })
        )
      })
    }
  )
})
