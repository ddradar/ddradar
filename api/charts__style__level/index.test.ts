import type { Context } from '@azure/functions'

import searchCharts from '.'

describe('GET /api/v1/charts/{playStyle}/{level}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const charts = [
    {
      id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      name: 'PARANOiA',
      series: 'DDR 1st',
      playStyle: 1,
      difficulty: 0,
      level: 4,
    } as const,
  ]
  beforeEach(() => (context.bindingData = {}))

  test('returns "200 OK" with JSON body if documents is not empty', async () => {
    // Arrange
    context.bindingData.playStyle = 1
    context.bindingData.level = 4

    // Act
    const result = await searchCharts(context, null, charts)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(charts)
  })

  test('returns "404 Not Found" if documents is empty', async () => {
    // Arrange
    context.bindingData.playStyle = 1
    context.bindingData.level = 4

    // Act
    const result = await searchCharts(context, null, [])

    // Assert
    expect(result.status).toBe(404)
  })
})
