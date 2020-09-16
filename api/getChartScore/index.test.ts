import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { fetchChartScores } from '../db/scores'
import getChartScore from '.'

jest.mock('../auth')
jest.mock('../db/scores')

describe('GET /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'query'>
  const fetchMock = mocked(fetchChartScores)

  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {}, query: {} }
    fetchMock.mockClear()
  })

  test('returns "404 Not Found" if fetchChartScores() returns empty', async () => {
    // Arrange
    fetchMock.mockResolvedValue([])
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0

    // Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "200 OK" with JSON body if fetchChartScores() returns array', async () => {
    // Arrange
    const chart = {
      songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      songName: 'PARANOiA',
      playStyle: 1,
      difficulty: 0,
      level: 4,
    } as const
    const scores = [
      {
        userId: '0',
        userName: '全国トップ',
        ...chart,
        score: 1000000,
        clearLamp: 7,
        rank: 'AAA',
      } as const,
    ]
    fetchMock.mockResolvedValue(scores)
    context.bindingData.songId = chart.songId
    context.bindingData.playStyle = chart.playStyle
    context.bindingData.difficulty = chart.difficulty
    req.query.scope = 'private'

    // Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(scores)
  })
})
