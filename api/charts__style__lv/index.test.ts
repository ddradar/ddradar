import { testSongData as song } from '@ddradar/core/__tests__/data'
import { describe, expect, test } from 'vitest'

import searchCharts from '.'

describe('GET /api/v1/charts/{style}/{lv}', () => {
  test('returns "404 Not Found" if no chart that matches conditions.', async () => {
    // Arrange - Act
    const result = await searchCharts(null, null, [])

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "200 OK" with JSON body if found', async () => {
    // Arrange
    const charts = [
      {
        id: song.id,
        name: song.name,
        series: song.series,
        playStyle: song.charts[0].playStyle,
        difficulty: song.charts[0].difficulty,
        level: song.charts[0].level,
      },
    ]

    // Act
    const result = await searchCharts(null, null, charts)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(charts)
  })
})
