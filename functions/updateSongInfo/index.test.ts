import type { ItemDefinition } from '@azure/cosmos'
import type { Database } from '@ddradar/core'
import { testSongData } from '@ddradar/core/__tests__/data'
import { fetchList, fetchTotalChartCount } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import updateSongInfo from '.'

vi.mock('@ddradar/db')

describe('/updateSongInfo/index.ts', () => {
  const song = { ...testSongData, skillAttackId: 1 }
  const oldCounts = [...Array(19 * 2).keys()].map(i => ({
    id: `id-${i}`, // id-0, id-1, ..., id-37
    playStyle: ((i % 2) + 1) as 1 | 2,
    level: (i % 19) + 1, // 1-19
    count: 1000,
  }))
  const newCounts = oldCounts.map(d => ({
    ...d,
    count: 2000,
  }))

  const context = {
    log: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  }
  beforeAll(() => {
    vi.mocked(fetchTotalChartCount).mockResolvedValue(newCounts)
  })
  beforeEach(() => {
    context.log.info.mockClear()
    context.log.warn.mockClear()
    context.log.error.mockClear()
    vi.mocked(fetchList).mockClear()
  })
  const validScore: Database.ScoreSchema & ItemDefinition = {
    id: `user1-${song.name}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
    userId: 'user1',
    userName: 'User 1',
    isPublic: true,
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[0].playStyle,
    difficulty: song.charts[0].difficulty,
    level: song.charts[0].level,
    clearLamp: 6,
    score: 999960,
    rank: 'AAA',
  }
  const worldScore = {
    ...validScore,
    id: '0',
    userId: '0',
    userName: '0',
    isPublic: false,
  }
  const emptyScore: Database.ScoreSchema = {
    clearLamp: 0,
    isPublic: false,
    rank: 'E',
    score: 0,
    userId: '0',
    userName: '0',
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[1].playStyle,
    difficulty: song.charts[1].difficulty,
    level: song.charts[1].level,
  }

  test('returns { scores: [] } if songs is empty', async () => {
    // Arrange
    vi.mocked(fetchList).mockResolvedValue([])

    // Act
    const result = await updateSongInfo(context, [], oldCounts)

    // Assert
    expect(result).toStrictEqual({
      scores: [],
      details: newCounts.map(d => ({ ...d, userId: '0' })),
    })
  })

  test('returns { scores: [emptyScore] } with log.info if scores is empty', async () => {
    // Arrange
    vi.mocked(fetchList).mockResolvedValue([])

    // Act
    const result = await updateSongInfo(context, [song], [])

    // Assert
    expect(result).toStrictEqual({
      scores: [
        {
          ...emptyScore,
          difficulty: song.charts[0].difficulty,
          level: song.charts[0].level,
        },
        emptyScore,
      ],
      details: newCounts.map(d => ({ ...d, id: undefined, userId: '0' })),
    })
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns  { scores: [emptyScore] } with log.info no need to update Scores', async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue([validScore, worldScore] as any)

    // Act
    const result = await updateSongInfo(context, [song], oldCounts)

    // Assert
    expect(result.scores).toStrictEqual([emptyScore])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns  { scores: [emptyScore] } with log.warn if maxCombo is invalid', async () => {
    // Arrange
    vi.mocked(fetchList).mockResolvedValue([
      { ...validScore, maxCombo: 3 },
      worldScore,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any)

    // Act
    const result = await updateSongInfo(context, [song], oldCounts)

    // Assert
    expect(result.scores).toStrictEqual([emptyScore])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns [emptyScore] with error if invalid Scores', async () => {
    // Arrange
    vi.mocked(fetchList).mockResolvedValue([
      { ...validScore, playStyle: 2, difficulty: 0 },
      worldScore,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any)

    // Act
    const result = await updateSongInfo(context, [song], oldCounts)

    // Assert
    expect(result.scores).toStrictEqual([emptyScore])
    expect(context.log.error).toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test.each([
    { ...validScore, songName: 'foo' },
    { ...validScore, level: 10 },
    { ...validScore, deleted: true },
  ])('returns [score] if Scores info has diff', async score => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue([score, worldScore] as any)

    // Act
    const result = await updateSongInfo(context, [song], oldCounts)

    // Assert
    expect(result.scores).toStrictEqual([validScore, emptyScore])
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test.each([{ ...validScore, deleted: false }, { ...validScore }])(
    'returns [score] if Scores info has diff',
    async score => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(fetchList).mockResolvedValue([score, worldScore] as any)

      // Act
      const result = await updateSongInfo(
        context,
        [{ ...song, deleted: true }],
        oldCounts
      )

      // Assert
      expect(result.scores).toStrictEqual([
        { ...validScore, deleted: true },
        { ...worldScore, deleted: true },
        { ...emptyScore, deleted: true },
      ])
      expect(context.log.error).not.toBeCalled()
      expect(context.log.warn).not.toBeCalled()
      expect(context.log.info).toBeCalled()
    }
  )
})
