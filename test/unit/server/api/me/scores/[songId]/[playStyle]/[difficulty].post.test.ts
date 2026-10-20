// oxlint-disable typescript/unbound-method - to mock db methods
import { db } from '@nuxthub/db'
import { scores } from '@nuxthub/db/schema'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import handler from '#server/api/me/scores/[songId]/[playStyle]/[difficulty].post'
import { FlareRank } from '#shared/schemas/score'
import { Difficulty, PlayStyle } from '#shared/schemas/step-chart'
import { notValidObject } from '~~/test/data/schema'
import { scoreRecord } from '~~/test/data/score'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { publicUser, sessionUser } from '~~/test/data/user'
import { createRequestEvent } from '~~/test/unit/util'

describe('POST /api/me/scores/[songId]/[playStyle]/[difficulty]', () => {
  const params = {
    songId: testSongData.id,
    playStyle: `${PlayStyle.SINGLE}`,
    difficulty: `${Difficulty.BASIC}`,
  }
  const song = { ...testSongData, charts: [...testStepCharts] }
  const body: ScoreRecord = { ...scoreRecord }

  // Mocks for db.insert().values().onConflictDoUpdate().returning()
  const returning = vi.fn<() => Promise<ScoreRecord[]>>()
  const values = vi.fn<() => void>(() => ({
    onConflictDoUpdate: vi.fn<() => void>(() => ({ returning })),
  }))

  beforeAll(() => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: publicUser.id,
      roles: sessionUser.roles,
    })
    vi.mocked(db.insert).mockReturnValue({ values } as never)
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
      const event = createRequestEvent(body, { songId, playStyle, difficulty })

      // Act - Assert
      await expect(handler(event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 400 })
      )
      expect(db.update).not.toHaveBeenCalled()
    }
  )

  test('returns 404 when song does not exist', async () => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(undefined)
    const event = createRequestEvent(body, params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(db.insert).not.toHaveBeenCalled()
  })

  test('returns 404 when chart does not exist', async () => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(song)
    const event = createRequestEvent(body, {
      ...params,
      playStyle: `${PlayStyle.DOUBLE}`,
      difficulty: `${Difficulty.BEGINNER}`,
    })

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
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
    { ...body, exScore: testStepCharts[1].notes * 3 + 1 },
    { ...body, maxCombo: testStepCharts[1].notes + 1 },
  ])('(body: %o) returns 400 when score record is invalid', async body => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(song)
    const event = createRequestEvent(body, params)

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(db.insert).not.toHaveBeenCalled()
  })

  test.each([
    body,
    { ...body, exScore: 200 },
    { ...body, maxCombo: testStepCharts[1].notes },
    { ...body, flareRank: FlareRank.V },
    { ...body, flareRank: FlareRank.III, flareSkill: 342 },
  ])('(body: %o) returns 200 with score', async body => {
    // Arrange
    vi.mocked(getCachedSongInfo).mockResolvedValue(song)
    returning.mockResolvedValue([{ ...body }])
    const event = createRequestEvent(body, params)

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual(body)
    expect(db.insert).toHaveBeenCalledWith(scores)
    expect(values).toHaveBeenCalledWith({
      songId: params.songId,
      playStyle: Number(params.playStyle),
      difficulty: Number(params.difficulty),
      userId: publicUser.id,
      ...body,
      createdBy: publicUser.id,
      updatedBy: publicUser.id,
      deletedAt: null,
    })
  })
})
