import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { fetchChartList } from '../db/songs'
import searchCharts from '.'

jest.mock('../db/songs')

describe('GET /api/v1/charts', () => {
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
  beforeEach(() => {
    context.bindingData = {}
    mocked(fetchChartList).mockClear()
    mocked(fetchChartList).mockResolvedValue(charts)
  })

  test('/1/4 calls fetchChartList(1, 4)', async () => {
    // Arrange
    context.bindingData.playStyle = 1
    context.bindingData.level = 4

    // Act
    const result = await searchCharts(context)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(charts)
    expect(mocked(fetchChartList)).toBeCalledWith(1, 4)
  })

  test('/1/20 returns "404 Not Found" if fetchChartList(1, 30) returns []', async () => {
    // Arrange
    context.bindingData.playStyle = 1
    context.bindingData.level = 20
    mocked(fetchChartList).mockResolvedValueOnce([])

    // Act
    const result = await searchCharts(context)

    // Assert
    expect(result.status).toBe(404)
    expect(mocked(fetchChartList)).toBeCalledWith(1, 20)
  })
})
