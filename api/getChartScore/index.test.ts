import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import { ScoreSchema, UserSchema } from '../db'
import getChartScore from '.'

jest.mock('../auth')

describe('GET /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'query'>

  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {}, query: {} }
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each(['', 'foo'])('/%s/1/0 returns "404 Not Found"', async songId => {
    // Arrange
    context.bindingData.songId = songId
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0

    // Act
    const result = await getChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each([0, -1, 3, 2.5, NaN, Infinity, -Infinity])(
    '/00000000000000000000000000000000/%d/0 returns "404 Not Found"',
    async playStyle => {
      // Arrange
      context.bindingData.songId = '00000000000000000000000000000000'
      context.bindingData.playStyle = playStyle
      context.bindingData.difficulty = 0

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(404)
    }
  )

  test.each([5, -1, 2.5, NaN, Infinity, -Infinity])(
    '/00000000000000000000000000000000/1/%d returns "404 Not Found"',
    async difficulty => {
      // Arrange
      context.bindingData.songId = '00000000000000000000000000000000'
      context.bindingData.playStyle = 1
      context.bindingData.difficulty = difficulty

      // Act
      const result = await getChartScore(context, req)

      // Assert
      expect(result.status).toBe(404)
    }
  )

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const userContainer = getContainer('Users')
      const scoreContainer = getContainer('Scores')
      const user: UserSchema = {
        id: 'private_user',
        loginId: 'private_user',
        name: 'EMI',
        area: 13,
        isPublic: false,
      }
      const scores: ScoreSchema[] = [
        {
          id: '0-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0',
          userId: '0',
          userName: '全国トップ',
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          isPublic: false,
        },
        {
          id: '13-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0',
          userId: '13',
          userName: '東京都トップ',
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 999980,
          clearLamp: 6,
          rank: 'AAA',
          isPublic: false,
        },
        {
          id: 'public_user-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0',
          userId: 'public_user',
          userName: 'AFRO',
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 999960,
          clearLamp: 6,
          rank: 'AAA',
          isPublic: true,
        },
        {
          id: 'private_user-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0',
          userId: 'private_user',
          userName: 'EMI',
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 999900,
          clearLamp: 6,
          rank: 'AAA',
          isPublic: false,
        },
        {
          id: '0-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-1',
          userId: '0',
          userName: '全国トップ',
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 1,
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          isPublic: false,
        },
      ]

      beforeAll(async () => {
        await userContainer.items.create(user)
        for (const score of scores) {
          await scoreContainer.items.create(score)
        }
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

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0 returns only World Best Score if anonymous', async () => {
        // Arrange
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0

        // Act
        const result = await getChartScore(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual([
          {
            userId: scores[0].userId,
            userName: scores[0].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[0].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[0].score,
            clearLamp: scores[0].clearLamp,
            rank: scores[0].rank,
          },
        ])
      })

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0?scope=medium returns only World Best Score if anonymous', async () => {
        // Arrange
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0
        req.query.scope = 'medium'

        // Act
        const result = await getChartScore(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual([
          {
            userId: scores[0].userId,
            userName: scores[0].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[0].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[0].score,
            clearLamp: scores[0].clearLamp,
            rank: scores[0].rank,
          },
        ])
      })

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0?scope=full returns all public scores if anonymous', async () => {
        // Arrange
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
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[0].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[0].score,
            clearLamp: scores[0].clearLamp,
            rank: scores[0].rank,
          },
          // Public User
          {
            userId: scores[2].userId,
            userName: scores[2].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[2].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[2].score,
            clearLamp: scores[2].clearLamp,
            rank: scores[2].rank,
          },
        ])
      })

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0 returns World Best, Area Best, and Personal Best Scores if authenticated', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'twitter',
          userDetails: user.id,
          userId: user.id,
          userRoles: ['anonymous', 'authenticated'],
        })
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0

        // Act
        const result = await getChartScore(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual([
          // World Best
          {
            userId: scores[0].userId,
            userName: scores[0].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[0].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[0].score,
            clearLamp: scores[0].clearLamp,
            rank: scores[0].rank,
          },
          // Area Best
          {
            userId: scores[1].userId,
            userName: scores[1].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[1].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[1].score,
            clearLamp: scores[1].clearLamp,
            rank: scores[1].rank,
          },
          // Personal Best
          {
            userId: scores[3].userId,
            userName: scores[3].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[3].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[3].score,
            clearLamp: scores[3].clearLamp,
            rank: scores[3].rank,
          },
        ])
      })

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0?scope=full returns Area Best, Personal Best, and all public Scores if authenticated', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'twitter',
          userDetails: user.id,
          userId: user.id,
          userRoles: ['anonymous', 'authenticated'],
        })
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
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[0].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[0].score,
            clearLamp: scores[0].clearLamp,
            rank: scores[0].rank,
          },
          // Area Best
          {
            userId: scores[1].userId,
            userName: scores[1].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[1].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[1].score,
            clearLamp: scores[1].clearLamp,
            rank: scores[1].rank,
          },
          // Public User
          {
            userId: scores[2].userId,
            userName: scores[2].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[2].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[2].score,
            clearLamp: scores[2].clearLamp,
            rank: scores[2].rank,
          },
          // Personal Best
          {
            userId: scores[3].userId,
            userName: scores[3].userName,
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: scores[3].songName,
            playStyle: 1,
            difficulty: 0,
            score: scores[3].score,
            clearLamp: scores[3].clearLamp,
            rank: scores[3].rank,
          },
        ])
      })

      afterAll(async () => {
        await userContainer.item(user.id, user.id).delete()
        for (const score of scores) {
          await scoreContainer.item(score.id, score.userId).delete()
        }
      })
    }
  )
})
