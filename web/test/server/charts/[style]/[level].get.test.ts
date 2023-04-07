// @vitest-environment node
import { testSongData } from '@ddradar/core/test/data'
import { fetchJoinedList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import searchCharts from '~~/server/api/v1/charts/[style]/[level].get'
import { sendNullWithError } from '~~/server/utils/http'
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
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchJoinedList).mockClear()
  })

  test.each([
    ['', ''],
    ['foo', 'bar'],
    ['0', '10'],
    ['1', '-10'],
  ])('(style: "%s", level: "%s") returns 404', async (style, level) => {
    // Arrange
    const event = createEvent({ style, level })

    // Act
    const charts = await searchCharts(event)

    // Assert
    expect(charts).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(fetchJoinedList)).not.toBeCalled()
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
      expect(vi.mocked(sendNullWithError)).not.toBeCalled()
      expect(vi.mocked(fetchJoinedList).mock.calls[0][3]).toStrictEqual([
        { condition: 'c.nameIndex NOT IN (-1, -2)' },
        ...conditions,
      ])
    }
  )
})
