import { and, eq, exists } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { songs } from 'hub:db:schema'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { seriesList } from '#shared/schemas/song'
import { handler } from '~~/server/api/songs/index.get'
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

  const findMany = vi.fn<typeof db.query.songs.findMany>()
  const originalQuery = vi.mocked(db).query
  const originalSelect = vi.mocked(db).select

  beforeAll(() => {
    vi.mocked(db).query = { songs: { findMany } } as never
    const mockQueryBuilder = {
      from: vi.fn(() => mockQueryBuilder),
      where: vi.fn(() => mockQueryBuilder),
    }
    vi.mocked(db).select = vi.fn(() => mockQueryBuilder) as never
  })
  beforeEach(() => findMany.mockClear())
  afterAll(() => {
    vi.mocked(db).query = originalQuery
    vi.mocked(db).select = originalSelect
  })

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
      findMany.mockResolvedValue(mockData as never)
      const event = { path: `/?${query}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toEqual(mockData)
      expect(findMany).toHaveBeenCalledTimes(1)
      const arg = findMany.mock.calls[0]?.[0]
      expect(arg?.where).toStrictEqual(and(...conditions))
      expect(arg?.with?.charts).toBeUndefined()
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
      findMany.mockResolvedValue(mockData as never)
      const event = { path: `/?${query}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toEqual(mockData)
      expect(findMany).toHaveBeenCalledTimes(1)
      const arg = findMany.mock.calls[0]?.[0]
      expect(arg?.where).toStrictEqual(and(...conditions))
      expect(arg?.with?.charts).toBeDefined()
    }
  )
})
