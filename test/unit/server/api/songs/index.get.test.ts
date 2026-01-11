import { and, eq, exists } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { songs } from 'hub:db:schema'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { seriesList } from '#shared/schemas/song'
import handler from '~~/server/api/songs/index.get'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'

describe('GET /api/songs', () => {
  const mockData: Awaited<ReturnType<typeof handler>> = [
    {
      ...testSongData,
      charts: testStepCharts.slice(0, 3).map(c => ({
        playStyle: c.playStyle,
        difficulty: c.difficulty,
        level: c.level,
      })),
    },
  ]

  beforeEach(() => vi.mocked(db.query.songs.findMany).mockClear())
  afterAll(() => vi.mocked(cachedEventHandler).mockClear())

  test.each([
    ['', []],
    ['includeCharts=false', []],
    ['name=-1', []],
    ['name=37', []],
    ['series=-1', []],
    ['series=20', []],
    ['style=0', []],
    ['style=3', []],
    ['level=0', []],
    ['level=21', []],
    ['name=0', [eq(songs.nameIndex, 0)]],
    ['series=0', [eq(songs.series, seriesList[0]!)]],
    [
      'name=10&series=10',
      [eq(songs.nameIndex, 10), eq(songs.series, seriesList[10]!)],
    ],
  ])(
    '(query: "%s") filters by expected conditions without including charts',
    async (query, conditions) => {
      // Arrange
      vi.mocked(db.query.songs.findMany).mockResolvedValue(mockData as never)
      const event = { path: `/?${query}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual(mockData)
      expect(vi.mocked(db.query.songs.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: and(...conditions),
          with: expect.objectContaining({
            charts: undefined,
          }),
        })
      )
    }
  )

  test.each([
    ['includeCharts=true', []],
    ['style=1&level=10', [exists(expect.anything())]],
    [
      'name=10&series=10&style=1&level=10',
      [
        eq(songs.nameIndex, 10),
        eq(songs.series, seriesList[10]!),
        exists(expect.anything()),
      ],
    ],
    ['series=14&includeCharts=true', [eq(songs.series, seriesList[14]!)]],
  ])(
    '(query: "%s") filters by expected conditions with including charts',
    async (query, conditions) => {
      // Arrange
      vi.mocked(db.query.songs.findMany).mockResolvedValue(mockData as never)
      const event = { path: `/?${query}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual(mockData)
      expect(vi.mocked(db.query.songs.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: and(...conditions),
          with: expect.objectContaining({
            charts: {
              columns: { playStyle: true, difficulty: true, level: true },
            },
          }),
        })
      )
    }
  )

  describe('cache', () => {
    test.each([
      ['', 'all'],
      ['includeCharts=true', 'withCharts:all'],
      ['name=5', 'name=5'],
      ['series=10', 'series=10'],
      ['style=2&level=15', 'withCharts:level=15&style=2'],
      ['name=3&series=7&style=0&level=5', 'name=3&series=7'],
    ])('getKey({query: "%s"}) returns "%s"', async (query, expected) => {
      // Arrange
      const event = { path: `/?${query}` } as unknown as H3Event
      const getKey = vi.mocked(cachedEventHandler).mock.calls[0]![1]!.getKey!

      // Act
      const result = await getKey(event)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
