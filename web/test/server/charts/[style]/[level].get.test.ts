// @vitest-environment node
import { fetchJoinedList } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { testSongData } from '~/../core/test/data'
import searchCharts from '~~/server/api/v1/charts/[style]/[level].get'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/http')

describe('GET /api/v1/charts/[style]/[level]', () => {
  const dbCharts = testSongData.charts.map(c => ({
    id: testSongData.id,
    name: testSongData.name,
    series: testSongData.series,
    playStyle: c.playStyle,
    difficulty: c.difficulty,
    level: c.level,
  }))
  beforeEach(() => {
    vi.mocked(fetchJoinedList).mockClear()
  })

  test.each([
    ['', ''],
    ['foo', 'bar'],
    ['0', '10'],
    ['1', '-10'],
  ])('(style: "%s", level: "%s") returns 400', async (style, level) => {
    // Arrange
    const event = createEvent({ style, level })

    // Act - Assert
    await expect(searchCharts(event)).rejects.toThrowError()
  })

  test.each([
    [
      '1',
      '1',
      [
        { condition: 'i.playStyle = @', value: 1 },
        { condition: 'i.level = @', value: 1 },
      ],
    ],
    [
      '2',
      '20',
      [
        { condition: 'i.playStyle = @', value: 2 },
        { condition: 'i.level = @', value: 20 },
      ],
    ],
  ])(
    `(style: "%s", level: "%s") calls fetchJoinedList(..., ..., %o, ...)`,
    async (style, level, conditions) => {
      // Arrange
      vi.mocked(fetchJoinedList).mockResolvedValue(dbCharts)
      const event = createEvent({ style, level })

      // Act
      const charts = await searchCharts(event)

      // Assert
      expect(charts).toBe(dbCharts)
      expect(vi.mocked(fetchJoinedList).mock.calls[0][3]).toStrictEqual([
        { condition: 'c.nameIndex NOT IN (-1, -2)' },
        ...conditions,
      ])
    }
  )
})
