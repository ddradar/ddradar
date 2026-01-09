import { and, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { charts, scores } from 'hub:db:schema'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ClearLamp, danceLevels, FlareRank } from '#shared/schemas/score'
import { range } from '#shared/utils'
import handler from '~~/server/api/users/[id]/scores.get'
import { Difficulty, PlayStyle } from '~~/shared/schemas/step-chart'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { privateUser, publicUser } from '~~/test/data/user'

describe('GET /api/users/[id]/scores', () => {
  const generateScores = (
    count: number,
    user: Pick<UserInfo, 'id' | 'name' | 'area'>
  ): ScoreSearchResult[] =>
    [...Array(count)].map(() => ({
      song: {
        id: testSongData.id,
        name: testSongData.name,
        artist: testSongData.artist,
      },
      chart: {
        playStyle: testStepCharts[0].playStyle,
        difficulty: testStepCharts[0].difficulty,
        level: testStepCharts[0].level,
      },
      user: { id: user.id, name: user.name, area: user.area },
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
    vi.mocked(getCachedUser).mockClear()
  })

  test.each(['', 'a', 'a'.repeat(33)])('(id: "%s") returns 400', async id => {
    // Arrange
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
    vi.mocked(getCachedUser).mockResolvedValue(publicUser)
    const event: Partial<H3Event> = { context: { params: { id } } }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getCachedUser)).not.toHaveBeenCalled()
    expect(vi.mocked(db.query.scores.findMany)).not.toHaveBeenCalled()
  })

  test.each([undefined, privateUser])(
    'returns 404 when user is %o',
    async user => {
      // Arrange
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
      vi.mocked(getCachedUser).mockResolvedValue(user)
      const event: Partial<H3Event> = {
        context: { params: { id: privateUser.id } },
      }

      // Act - Assert
      await expect(handler(event as H3Event)).rejects.toThrowError(
        expect.objectContaining({ statusCode: 404 })
      )
      expect(vi.mocked(getCachedUser)).toHaveBeenCalledWith(
        event,
        privateUser.id
      )
      expect(vi.mocked(db.query.scores.findMany)).not.toHaveBeenCalled()
    }
  )

  describe.each([
    [
      '',
      { limit: 50, offset: 0, nextOffset: null, hasMore: false },
      [
        eq(scores.songId, scores.songId),
        inArray(scores.playStyle, [PlayStyle.SINGLE, PlayStyle.DOUBLE]),
        inArray(
          scores.difficulty,
          range(Difficulty.BEGINNER, Difficulty.CHALLENGE)
        ),
        inArray(scores.rank, danceLevels),
        inArray(scores.clearLamp, range(ClearLamp.Failed, ClearLamp.MFC)),
        inArray(scores.flareRank, range(FlareRank.None, FlareRank.EX)),
      ],
      inArray(charts.level, range(1, 20)),
    ],
    [
      `id=${testSongData.id}&style=${testStepCharts[0].playStyle}&diff=${testStepCharts[0].difficulty}&lv=${testStepCharts[0].level}&clear=${ClearLamp.MFC}&flare=${FlareRank.None}&rank=AAA`,
      { limit: 50, offset: 0, nextOffset: null, hasMore: false },
      [
        eq(scores.songId, testSongData.id),
        inArray(scores.playStyle, [testStepCharts[0].playStyle]),
        inArray(scores.difficulty, [testStepCharts[0].difficulty]),
        inArray(scores.rank, ['AAA']),
        inArray(scores.clearLamp, [ClearLamp.MFC]),
        inArray(scores.flareRank, [FlareRank.None]),
      ],
      inArray(charts.level, [testStepCharts[0].level]),
    ],
    [
      'limit=2&offset=1',
      { limit: 2, offset: 1, nextOffset: 3, hasMore: true },
      [
        eq(scores.songId, scores.songId),
        inArray(scores.playStyle, [PlayStyle.SINGLE, PlayStyle.DOUBLE]),
        inArray(
          scores.difficulty,
          range(Difficulty.BEGINNER, Difficulty.CHALLENGE)
        ),
        inArray(scores.rank, danceLevels),
        inArray(scores.clearLamp, range(ClearLamp.Failed, ClearLamp.MFC)),
        inArray(scores.flareRank, range(FlareRank.None, FlareRank.EX)),
      ],
      inArray(charts.level, range(1, 20)),
    ],
  ])(
    '(query: "%s") filters by expected conditions',
    (query, pagenation, conditionsForScores, conditionForCharts) => {
      test('without authentication', async () => {
        // Arrange
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
        vi.mocked(getCachedUser).mockResolvedValue(publicUser)
        const items = generateScores(5, publicUser)
        vi.mocked(db.query.scores.findMany).mockResolvedValue(items as never)
        const pathSuffix = query ? `?${query}` : ''
        const event: Partial<H3Event> = {
          path: `/api/users/${publicUser.id}/scores${pathSuffix}`,
          context: { params: { id: publicUser.id } },
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
              isNull(scores.deletedAt),
              isNotNull(sql`chart`),
              eq(scores.userId, publicUser.id),
              ...conditionsForScores
            ),
            with: expect.objectContaining({
              chart: { columns: { level: true }, where: conditionForCharts },
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
        vi.mocked(getCachedUser).mockResolvedValue(privateUser)
        const items = generateScores(5, privateUser)
        vi.mocked(db.query.scores.findMany).mockResolvedValue(items as never)
        const pathSuffix = query ? `?${query}` : ''
        const event: Partial<H3Event> = {
          path: `/api/users/${privateUser.id}/scores${pathSuffix}`,
          context: { params: { id: privateUser.id } },
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
              isNull(scores.deletedAt),
              isNotNull(sql`chart`),
              eq(scores.userId, privateUser.id),
              ...conditionsForScores
            ),
            with: expect.objectContaining({
              chart: { columns: { level: true }, where: conditionForCharts },
            }),
          })
        )
      })
    }
  )
})
