// @vitest-environment node
import { testSongData } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/charts/[style]/[level].get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/charts/[style]/[level]', () => {
  const dbCharts = testSongData.charts.map(c => ({
    id: testSongData.id,
    name: testSongData.name,
    nameKana: testSongData.nameKana,
    nameIndex: testSongData.nameIndex,
    artist: testSongData.artist,
    series: testSongData.series,
    folders: [
      ...testSongData.folders,
      { type: 'level', name: c.level.toString() },
    ],
    playStyle: c.playStyle,
    difficulty: c.difficulty,
    level: c.level,
  }))
  beforeEach(() => {
    vi.mocked(getSongRepository).mockClear()
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
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getSongRepository)).not.toHaveBeenCalled()
  })

  test.each([
    [
      '1',
      '1',
      [
        { condition: 'c.playStyle = @', value: 1 },
        { condition: 'c.level = @', value: 1 },
      ],
    ],
    [
      '2',
      '20',
      [
        { condition: 'c.playStyle = @', value: 2 },
        { condition: 'c.level = @', value: 20 },
      ],
    ],
  ])(
    `(style: "%s", level: "%s") calls SongRepository.listCharts(%o)`,
    async (style, level, conditions) => {
      // Arrange
      const listCharts = vi.fn().mockResolvedValue(dbCharts)
      vi.mocked(getSongRepository).mockReturnValue({
        listCharts,
      } as unknown as ReturnType<typeof getSongRepository>)
      const event = createEvent({ style, level })

      // Act
      const charts = await handler(event)

      // Assert
      expect(charts).toBe(dbCharts)
      expect(vi.mocked(getSongRepository)).toHaveBeenCalled()
      expect(listCharts).toHaveBeenCalledWith(conditions)
    }
  )
})
