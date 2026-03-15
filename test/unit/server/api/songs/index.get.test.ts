import { db } from '@nuxthub/db'
import { songs } from '@nuxthub/db/schema'
import { and, asc, exists, inArray, isNull } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { seriesList } from '#shared/schemas/song'
import handler from '~~/server/api/songs/index.get'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'

describe('GET /api/songs', () => {
  const songItems: SongSearchResult[] = [
    {
      ...testSongData,
      charts: testStepCharts.slice(0, 3).map(c => ({
        playStyle: c.playStyle,
        difficulty: c.difficulty,
        level: c.level,
      })),
    },
  ]
  const defaultPagination = {
    limit: 50,
    offset: 0,
    nextOffset: null,
    hasMore: false,
  }

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
    ['name=0', [inArray(songs.nameIndex, [0])]],
    ['series=0', [inArray(songs.series, [seriesList[0]!])]],
    [
      'name=10&series=10',
      [
        inArray(songs.nameIndex, [10]),
        inArray(songs.series, [seriesList[10]!]),
      ],
    ],
    ['name=0&name=10', [inArray(songs.nameIndex, [0, 10])]],
    [
      'series=0&series=5',
      [inArray(songs.series, [seriesList[0]!, seriesList[5]!])],
    ],
  ])(
    '(query: "%s") filters by expected conditions without including charts',
    async (query, conditions) => {
      // Arrange
      vi.mocked(db.query.songs.findMany).mockResolvedValue(songItems as never)
      const event = { path: `/?${query}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual({ items: songItems, ...defaultPagination })
      expect(vi.mocked(db.query.songs.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: and(isNull(songs.deletedAt), ...conditions),
          with: expect.objectContaining({
            charts: undefined,
          }),
          orderBy: [asc(songs.nameIndex), asc(songs.nameKana)],
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
        inArray(songs.nameIndex, [10]),
        inArray(songs.series, [seriesList[10]!]),
        exists(expect.anything()),
      ],
    ],
    [
      'series=14&includeCharts=true',
      [inArray(songs.series, [seriesList[14]!])],
    ],
  ])(
    '(query: "%s") filters by expected conditions with including charts',
    async (query, conditions) => {
      // Arrange
      vi.mocked(db.query.songs.findMany).mockResolvedValue(songItems as never)
      const event = { path: `/?${query}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual({ items: songItems, ...defaultPagination })
      expect(vi.mocked(db.query.songs.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: and(isNull(songs.deletedAt), ...conditions),
          with: expect.objectContaining({
            charts: expect.objectContaining({
              columns: { playStyle: true, difficulty: true, level: true },
            }),
          }),
          orderBy: [asc(songs.nameIndex), asc(songs.nameKana)],
        })
      )
    }
  )

  describe('pagination', () => {
    test('returns hasMore=true and nextOffset when more items exist', async () => {
      // Arrange - mock returns limit+1 items to simulate more pages
      const manyItems = Array.from({ length: 51 }, () => songItems[0]!)
      vi.mocked(db.query.songs.findMany).mockResolvedValue(manyItems as never)
      const event = { path: '/?limit=50&offset=0' } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual({
        items: manyItems.slice(0, 50),
        limit: 50,
        offset: 0,
        nextOffset: 50,
        hasMore: true,
      })
    })

    test('passes offset and limit to db query', async () => {
      vi.mocked(db.query.songs.findMany).mockResolvedValue([] as never)
      const event = { path: '/?limit=10&offset=20' } as unknown as H3Event

      await handler(event)

      expect(vi.mocked(db.query.songs.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 11, offset: 20 })
      )
    })
  })

  describe('cache', () => {
    test.each([
      ['', 'all'],
      ['includeCharts=true', 'withCharts:all'],
      ['name=5', 'name=5'],
      ['series=10', 'series=10'],
      ['style=2&level=15', 'withCharts:level=15&style=2'],
      ['name=3&series=7&style=0&level=5', 'withCharts:level=5&name=3&series=7'],
      ['name=0&name=10', 'name=0,10'],
      ['limit=10&offset=20', 'limit=10&offset=20'],
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
