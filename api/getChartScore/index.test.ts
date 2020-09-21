import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { canConnectDB, getContainer, ScoreSchema, UserSchema } from '../db'
import getChartScore from '.'

jest.mock('../auth')

describe('GET /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'query'>

  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {}, query: {} }
  })

  test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0?scope=private returns "404 Not Found" if anonymous', async () => {
    // Arrange
    context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.query.scope = 'private'

    // Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  describeIf(canConnectDB)('Cosmos DB integration test', () => {
    const userContainer = getContainer('Users')
    const scoreContainer = getContainer('Scores')
    const user: UserSchema = {
      id: 'private_user',
      loginId: 'private_user',
      name: 'EMI',
      area: 13,
      isPublic: false,
    }
    const chart = {
      songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      songName: 'PARANOiA',
      playStyle: 1,
      difficulty: 0,
      level: 4,
    } as const
    const scores: readonly (ScoreSchema & { id: string })[] = [
      {
        id: `0-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
        userId: '0',
        userName: '全国トップ',
        ...chart,
        score: 1000000,
        clearLamp: 7,
        rank: 'AAA',
        isPublic: false,
      },
      {
        id: `13-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
        userId: '13',
        userName: '東京都トップ',
        ...chart,
        score: 999980,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: false,
      },
      {
        id: `public_user-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
        userId: 'public_user',
        userName: 'AFRO',
        ...chart,
        score: 999960,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: true,
      },
      {
        id: `${user.id}-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
        userId: user.id,
        userName: user.name,
        ...chart,
        score: 999900,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: user.isPublic,
      },
      {
        id: `0-${chart.songId}-${chart.playStyle}-1`,
        userId: '0',
        userName: '全国トップ',
        ...chart,
        difficulty: 1,
        level: 8,
        score: 1000000,
        clearLamp: 7,
        rank: 'AAA',
        isPublic: false,
      },
    ] as const

    beforeAll(async () => {
      await userContainer.items.create(user)
      await Promise.all(scores.map(s => scoreContainer.items.create(s)))
    })
    afterAll(async () => {
      await userContainer.item(user.id, user.id).delete()
      await Promise.all(
        scores.map(s => scoreContainer.item(s.id, s.userId).delete())
      )
    })

    test.each([
      ['00000000000000000000000000000000', 1, 0],
      ['06loOQ0DQb0DqbOibl6qO81qlIdoP9DI', 2, 0],
      ['06loOQ0DQb0DqbOibl6qO81qlIdoP9DI', 1, 4],
    ])(
      '/%s/%i/%i returns "404 Not Found"',
      async (songId, playStyle, difficulty) => {
        // Arrange
        context.bindingData.songId = songId
        context.bindingData.playStyle = playStyle
        context.bindingData.difficulty = difficulty

        // Act
        const result = await getChartScore(context, req)

        // Assert
        expect(result.status).toBe(404)
      }
    )

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty} returns only World Best Score if anonymous`, async () => {
      // Arrange
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([
        {
          userId: scores[0].userId,
          userName: scores[0].userName,
          ...chart,
          score: scores[0].score,
          clearLamp: scores[0].clearLamp,
          rank: scores[0].rank,
        },
      ])
    })

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty}?scope=medium returns only World Best Score if anonymous`, async () => {
      // Arrange
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty
      req.query.scope = 'medium'

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([
        {
          userId: scores[0].userId,
          userName: scores[0].userName,
          ...chart,
          score: scores[0].score,
          clearLamp: scores[0].clearLamp,
          rank: scores[0].rank,
        },
      ])
    })

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty}?scope=full returns all public scores if anonymous`, async () => {
      // Arrange
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty
      req.query.scope = 'full'

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([
        // World Best
        {
          userId: scores[0].userId,
          userName: scores[0].userName,
          ...chart,
          score: scores[0].score,
          clearLamp: scores[0].clearLamp,
          rank: scores[0].rank,
        },
        // Public User
        {
          userId: scores[2].userId,
          userName: scores[2].userName,
          ...chart,
          score: scores[2].score,
          clearLamp: scores[2].clearLamp,
          rank: scores[2].rank,
        },
      ])
    })

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty} returns only World Best Score if unregisted user`, async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValue({
        identityProvider: 'twitter',
        userDetails: 'foo',
        userId: 'foo',
        userRoles: ['anonymous', 'authenticated'],
      })
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([
        {
          userId: scores[0].userId,
          userName: scores[0].userName,
          ...chart,
          score: scores[0].score,
          clearLamp: scores[0].clearLamp,
          rank: scores[0].rank,
        },
      ])
    })

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty}?scope=private returns "404 Not Found" if unregisted user`, async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        identityProvider: 'twitter',
        userDetails: 'foo',
        userId: 'foo',
        userRoles: ['anonymous', 'authenticated'],
      })
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty
      req.query.scope = 'private'

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(404)
    })

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty} returns World Best, Area Best, and Personal Best Scores if authenticated`, async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        identityProvider: 'twitter',
        userDetails: user.id,
        userId: user.loginId ?? '',
        userRoles: ['anonymous', 'authenticated'],
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(user)
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([
        // World Best
        {
          userId: scores[0].userId,
          userName: scores[0].userName,
          ...chart,
          score: scores[0].score,
          clearLamp: scores[0].clearLamp,
          rank: scores[0].rank,
        },
        // Area Best
        {
          userId: scores[1].userId,
          userName: scores[1].userName,
          ...chart,
          score: scores[1].score,
          clearLamp: scores[1].clearLamp,
          rank: scores[1].rank,
        },
        // Personal Best
        {
          userId: scores[3].userId,
          userName: scores[3].userName,
          ...chart,
          score: scores[3].score,
          clearLamp: scores[3].clearLamp,
          rank: scores[3].rank,
        },
      ])
    })

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty}?scope=private returns only Personal Best Score if authenticated`, async () => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(user)
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty
      req.query.scope = 'private'

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([
        // Personal Best
        {
          userId: scores[3].userId,
          userName: scores[3].userName,
          ...chart,
          score: scores[3].score,
          clearLamp: scores[3].clearLamp,
          rank: scores[3].rank,
        },
      ])
    })

    test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0?scope=full returns Area Best, Personal Best, and all public Scores if authenticated', async () => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(user)
      context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
      context.bindingData.playStyle = 1
      context.bindingData.difficulty = 0
      req.query.scope = 'full'

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([
        // World Best
        {
          userId: scores[0].userId,
          userName: scores[0].userName,
          ...chart,
          score: scores[0].score,
          clearLamp: scores[0].clearLamp,
          rank: scores[0].rank,
        },
        // Area Best
        {
          userId: scores[1].userId,
          userName: scores[1].userName,
          ...chart,
          score: scores[1].score,
          clearLamp: scores[1].clearLamp,
          rank: scores[1].rank,
        },
        // Public User
        {
          userId: scores[2].userId,
          userName: scores[2].userName,
          ...chart,
          score: scores[2].score,
          clearLamp: scores[2].clearLamp,
          rank: scores[2].rank,
        },
        // Personal Best
        {
          userId: scores[3].userId,
          userName: scores[3].userName,
          ...chart,
          score: scores[3].score,
          clearLamp: scores[3].clearLamp,
          rank: scores[3].rank,
        },
      ])
    })
  })
})
