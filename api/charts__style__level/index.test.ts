import type { Api } from '@ddradar/core'
import { testSongData as song } from '@ddradar/core/__tests__/data'

import searchCharts from '.'

describe('GET /api/v1/charts/{playStyle}/{level}', () => {
  const context = { bindingData: { playStyle: 1, level: 4 } }

  test('returns "200 OK" with JSON body if documents is not empty', async () => {
    // Arrange
    const charts: Api.ChartInfo[] = [
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
    const result = await searchCharts(context, null, charts)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(charts)
  })

  test('returns "404 Not Found" if documents is empty', async () => {
    // Arrange - Act
    const result = await searchCharts(context, null, [])

    // Assert
    expect(result.status).toBe(404)
  })
})
