import type { H3Event } from 'h3'
import { scores } from 'hub:db:schema'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { FlareRank } from '#shared/schemas/score'
import { Difficulty, PlayStyle } from '#shared/schemas/step-chart'
import handler from '~~/server/api/me//scores/[songId]/[playStyle]/[difficulty].post'
import { notValidObject } from '~~/test/data/schema'
import { scoreRecord } from '~~/test/data/score'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { publicUser, sessionUser } from '~~/test/data/user'

describe('POST /api/me/scores/[songId]/[playStyle]/[difficulty]', () => {
  const params = {
    songId: testSongData.id,
    playStyle: `${PlayStyle.SINGLE}`,
    difficulty: `${Difficulty.BASIC}`,
  }
  const song = { ...testSongData, charts: [...testStepCharts] }
  const body: ScoreRecord = { ...scoreRecord }

  // Mocks for db.insert().values().onConflictDoUpdate().returning()
  const returning = vi.fn()
  const values = vi.fn(() => ({
    onConflictDoUpdate: vi.fn(() => ({ returning })),
  }))

  beforeAll(() => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: publicUser.id,
      roles: sessionUser.roles,
    })
    vi.mocked(db.insert).mockReturnValue({ values } as never)
  })
  beforeEach(() => {
    vi.mocked(db.insert).mockClear()
    values.mockClear()
    returning.mockClear()
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
        method: 'POST',
        context: { params: { songId, playStyle, difficulty } },
        node: {
          req: {
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
          },
        } as never,
      }

      // Act - Assert
      await expect(handler(event as H3Event)).rejects.toThrowError(
        expect.objectContaining({ statusCode: 400 })
      )
      expect(db.update).not.toHaveBeenCalled()
    }
  )

  test('returns 404 when song does not exist', async () => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(undefined)
    const event: Partial<H3Event> = {
      method: 'POST',
      context: { params },
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(db.insert).not.toHaveBeenCalled()
  })

  test('returns 404 when chart does not exist', async () => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(song)
    const event: Partial<H3Event> = {
      method: 'POST',
      context: {
        params: {
          ...params,
          playStyle: `${PlayStyle.DOUBLE}`,
          difficulty: `${Difficulty.BEGINNER}`,
        },
      },
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(db.insert).not.toHaveBeenCalled()
  })

  test.each([
    ...notValidObject,
    { ...body, normalScore: -1 },
    { ...body, clearLamp: 10 },
    { ...body, rank: 'INVALID_RANK' },
    { ...body, flareSkill: 2000 },
    { ...body, exScore: (testStepCharts[1]?.notes ?? 0) * 3 + 1 },
    { ...body, maxCombo: (testStepCharts[1]?.notes ?? 0) + 1 },
  ])('(body: %o) returns 400 when score record is invalid', async body => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(song)
    const event: Partial<H3Event> = {
      method: 'POST',
      context: { params },
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(db.insert).not.toHaveBeenCalled()
  })

  test.each([
    body,
    { ...body, exScore: 200 },
    { ...body, maxCombo: testStepCharts[1]?.notes ?? null },
    { ...body, flareRank: FlareRank.V },
    { ...body, flareRank: FlareRank.III, flareSkill: 342 },
  ])('(body: %o) returns 200 with score', async body => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(song)
    returning.mockResolvedValue([{ ...body }])
    const event: Partial<H3Event> = {
      method: 'POST',
      context: { params },
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act
    const result = await handler(event as H3Event)

    // Assert
    expect(result).toStrictEqual(body)
    expect(db.insert).toHaveBeenCalledWith(scores)
    expect(values).toHaveBeenCalledWith({
      songId: params.songId,
      playStyle: Number(params.playStyle),
      difficulty: Number(params.difficulty),
      userId: publicUser.id,
      ...body,
      deletedAt: null,
    })
  })
})
