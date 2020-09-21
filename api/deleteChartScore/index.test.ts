import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { canConnectDB, getContainer, ScoreSchema } from '../db'
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
    expect(result.httpResponse.status).toBe(401)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0

    // Act
    const result = await deleteChartScore(context, req)

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  describeIf(canConnectDB)('Cosmos DB integration test', () => {
    const user = {
      id: 'public_user',
      loginId: 'public_user',
      name: 'AFRO',
      area: 13,
      isPublic: true,
    } as const
    const scoreContainer = getContainer('Scores')
    const chart = {
      songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      songName: 'PARANOiA',
      playStyle: 1,
      difficulty: 0,
      level: 4,
    } as const
    const scores: readonly (ScoreSchema & { id: string })[] = [
      {
        id: '0-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0',
        userId: '0',
        userName: '0',
        ...chart,
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
        ...chart,
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
        ...chart,
        score: 970630, // P:28, Gr:10
        clearLamp: 5,
        rank: 'AA+',
        maxCombo: 138,
        exScore: 366,
        isPublic: user.isPublic,
      },
    ] as const

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
        expect(result.httpResponse.status).toBe(404)
      }
    )

    test(`/${chart.songId}/${chart.playStyle}/${chart.difficulty} returns "204 No Content"`, async () => {
      // Arrange
      context.bindingData.songId = chart.songId
      context.bindingData.playStyle = chart.playStyle
      context.bindingData.difficulty = chart.difficulty

      // Act
      const result = await deleteChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(204)
      expect(result.documents?.[0]).toStrictEqual({ ...scores[2], ttl: 3600 })
    })

    afterEach(async () => {
      await Promise.all(
        scores.map(s => scoreContainer.item(s.id, s.userId).delete())
      )
    })
  })
})
