import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { fetchChartScores, fetchScore } from '../db/scores'
import getChartScore from '.'

jest.mock('../auth')
jest.mock('../db/scores')

describe('GET /api/v1/scores', () => {
  const songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
  const playStyle = 1
  const difficulty = 0
  const context = { bindingData: { songId, playStyle, difficulty } }
  let req: Pick<HttpRequest, 'headers' | 'query'>
  const user = {
    id: 'private_user',
    loginId: 'private_user',
    name: 'EMI',
    area: 13,
    isPublic: false,
  } as const
  const score = {
    userId: '0',
    userName: '0',
    songId,
    songName: 'PARANOiA',
    playStyle,
    difficulty,
    level: 4,
    score: 1000000,
    clearLamp: 7,
    rank: 'AAA',
    isPublic: false,
  } as const
  const singleMock = mocked(fetchScore)
  const multipleMock = mocked(fetchChartScores)

  beforeEach(() => {
    req = { headers: {}, query: {} }
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'twitter',
      userDetails: user.id,
      userId: user.loginId,
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(getLoginUserInfo).mockResolvedValue(user)
    singleMock.mockClear()
    multipleMock.mockClear()
    singleMock.mockResolvedValue(score)
    multipleMock.mockResolvedValue([score])
  })

  test('?scope=private returns "404 Not Found" if anonymous', async () => {
    // Arrange
    req.query.scope = 'private'
    mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test('?scope=private returns "404 Not Found" if fetchScore returns null', async () => {
    // Arrange
    req.query.scope = 'private'
    singleMock.mockResolvedValueOnce(null)

    // Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
    expect(singleMock).toBeCalled()
    expect(multipleMock).not.toBeCalled()
  })

  test.each(['medium', 'full', ''])(
    '?scope=%s returns "404 Not Found" if fetchChartScores returns []',
    async scope => {
      // Arrange
      req.query.scope = scope
      multipleMock.mockResolvedValueOnce([])

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(404)
      expect(singleMock).not.toBeCalled()
      expect(multipleMock).toBeCalled()
    }
  )

  test('?scope=private returns "200 OK" with JSON if fetchScore returns score', async () => {
    // Arrange
    req.query.scope = 'private'

    // Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual([score])
    expect(singleMock).toBeCalled()
    expect(multipleMock).not.toBeCalled()
  })

  test.each(['medium', 'full', ''])(
    '?scope=%s returns "404 Not Found" if fetchChartScores returns scores',
    async scope => {
      // Arrange
      req.query.scope = scope

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([score])
      expect(singleMock).not.toBeCalled()
      expect(multipleMock).toBeCalled()
    }
  )
})
