import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import { ScoreSchema } from '../db'
import deleteChartScore from '.'

jest.mock('../auth')

describe('DELETE /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  const req = { headers: {} }

  beforeEach(() => {
    context = { bindingData: {} }
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userId: 'some_user',
      userDetails: 'some_user',
      userRoles: ['anonymous', 'authenticated'],
    })
  })

  test('returns "401 Unauthenticated" if no authentication', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await deleteChartScore(context, req)

    // Assert
    expect(result.status).toBe(401)
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await deleteChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each(['', 'foo'])('/%s/1/0 returns "404 Not Found"', async songId => {
    // Arrange
    context.bindingData.songId = songId
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0

    // Act
    const result = await deleteChartScore(context, req)

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
      const result = await deleteChartScore(context, req)

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
      const result = await deleteChartScore(context, req)

      // Assert
      expect(result.status).toBe(404)
    }
  )

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0

    // Act
    const result = await deleteChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const user = {
        id: 'public_user',
        loginId: 'public_user',
        name: 'AFRO',
        area: 13,
        isPublic: true,
      } as const
      const scoreContainer = getContainer('Scores')
      const scores: ScoreSchema[] = [
        {
          id: '0-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0',
          userId: '0',
          userName: '0',
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 999620, // P:38
          clearLamp: 6,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 376,
          isPublic: false,
        },
        {
          id: '13-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0',
          userId: '13',
          userName: '13',
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 996720, // P:37, Gr:1
          clearLamp: 5,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 375,
          isPublic: false,
        },
        {
          id: `${user.id}-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0`,
          userId: user.id,
          userName: user.name,
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 970630, // P:28, Gr:10
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
          isPublic: user.isPublic,
        },
      ]

      beforeEach(async () => {
        await Promise.all(scores.map(s => scoreContainer.items.create(s)))
        mocked(getClientPrincipal).mockReturnValue({
          identityProvider: 'github',
          userDetails: 'github_account',
          userRoles: ['anonymous', 'authenticated'],
          userId: user.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValue(user)
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
          const result = await deleteChartScore(context, req)

          // Assert
          expect(result.status).toBe(404)
        }
      )

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI/1/0 returns "204 No Content"', async () => {
        // Arrange
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0

        // Act
        const result = await deleteChartScore(context, req)
        const { resources } = await scoreContainer.items.readAll().fetchAll()

        // Assert
        expect(result.status).toBe(204)
        expect(resources).toHaveLength(2)

        // Clean up
        scoreContainer.items.create(scores[2])
      })

      afterEach(async () => {
        await Promise.all(
          scores.map(s => scoreContainer.item(s.id, s.userId).delete())
        )
      })
    }
  )
})
