import type { Context, HttpRequest } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import { ScoreSchema, UserSchema } from '../db'
import getChartScore from '.'

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
      const users: UserSchema[] = [
        {
          id: 'public_user',
          loginId: 'public_user',
          name: 'AFRO',
          area: 13,
          isPublic: true,
        },
        {
          id: 'private_user',
          loginId: 'private_user',
          name: 'EMI',
          area: 13,
          isPublic: false,
        },
      ]
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
        for (const user of users) {
          await userContainer.items.create(user)
        }
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

      afterAll(async () => {
        for (const user of users) {
          await userContainer.item(user.id, user.id).delete()
        }
        for (const score of scores) {
          await scoreContainer.item(score.id, score.userId).delete()
        }
      })
    }
  )
})
