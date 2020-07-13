import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { ClientPrincipal, getClientPrincipal, getLoginUserInfo } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import { ScoreSchema } from '../db'
import { musicDataToScoreList } from '../eagate'
import importScores from '.'

jest.mock('../auth')
jest.mock('../eagate')

describe('POST /api/v1/scores', () => {
  let req: Pick<HttpRequest, 'headers' | 'body'>

  beforeEach(() => {
    req = { headers: {} }
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userId: 'some_user',
      userDetails: 'some_user',
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(getLoginUserInfo).mockResolvedValue({
      id: 'some_user',
      loginId: 'some_user',
      name: 'Some User',
      area: 13,
      isPublic: true,
    })
  })

  test('returns "401 Unauthenticated" if no authentication', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await importScores(null, req)

    // Assert
    expect(result.status).toBe(401)
  })

  test.each([{}, { type: 'eagate_music_data' }, { type: 'foo', body: 'bar' }])(
    'returns "400 Bad Request" if body is %p',
    async body => {
      // Arrange
      req.body = body

      // Act
      const result = await importScores(null, req)

      // Assert
      expect(result.status).toBe(400)
    }
  )

  test('returns "400 Bad Request" if musicDataToScoreList() throws error', async () => {
    // Arrange
    mocked(musicDataToScoreList).mockImplementationOnce(() => {
      throw new Error()
    })
    req.body = { type: 'eagate_music_data', body: '' }

    // Act
    const result = await importScores(null, req)

    // Assert
    expect(result.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(null)
    req.body = { type: 'eagate_music_data', body: '' }

    // Act
    const result = await importScores(null, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "200 OK" with { count: 0 }', async () => {
    // Arrange
    mocked(musicDataToScoreList).mockReturnValueOnce([])
    req.body = { type: 'eagate_music_data', body: '' }

    // Act
    const result = await importScores(null, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({ count: 0 })
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const scoreContainer = getContainer('Scores')
      const publicUser = {
        id: 'public_user',
        loginId: 'public_user',
        name: 'AFRO',
        area: 13,
        isPublic: true,
      } as const
      const areaHiddenUser = {
        id: 'area_hidden_user',
        loginId: 'area_hidden_user',
        name: 'ZERO',
        area: 0,
        isPublic: true,
      } as const
      const privateUser = {
        id: 'private_user',
        loginId: 'private_user',
        name: 'EMI',
        area: 13,
        isPublic: false,
      } as const
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
          id: `${publicUser.id}-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0`,
          userId: publicUser.id,
          userName: publicUser.name,
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 970630, // P:28, Gr:10
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
          isPublic: publicUser.isPublic,
        },
        {
          id: `${areaHiddenUser.id}-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0`,
          userId: areaHiddenUser.id,
          userName: areaHiddenUser.name,
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 970630, // P:28, Gr:10
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
          isPublic: areaHiddenUser.isPublic,
        },
        {
          id: `${privateUser.id}-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-0`,
          userId: privateUser.id,
          userName: privateUser.name,
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          score: 970630, // P:28, Gr:10
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
          isPublic: privateUser.isPublic,
        },
      ]
      const clientPrincipal: Pick<
        ClientPrincipal,
        'identityProvider' | 'userRoles' | 'userDetails'
      > = {
        identityProvider: 'github',
        userDetails: 'github_account',
        userRoles: ['anonymous', 'authenticated'],
      }

      beforeEach(async () => {
        await Promise.all(scores.map(s => scoreContainer.items.create(s)))
      })

      test.each([
        { score: 900000, rank: 'AA' } as const,
        { score: 890000, clearLamp: 4, rank: 'AA-' } as const,
        { score: 880000, maxCombo: 58, rank: 'A+' } as const,
        { score: 890000, exScore: 300, rank: 'AA-' } as const,
        {
          score: 970630,
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
        } as const,
      ])('does not upsert score if body is %p', async score => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        req.body = { type: 'eagate_music_data', body: '' }
        mocked(musicDataToScoreList).mockReturnValueOnce([
          {
            songId: scores[0].songId,
            songName: scores[0].songName,
            playStyle: scores[0].playStyle,
            difficulty: scores[0].difficulty,
            clearLamp: 2,
            ...score,
          },
        ])
        const { resource } = await scoreContainer
          .item(scores[2].id, scores[2].userId)
          .read<ScoreSchema>()

        // Act
        const result = await importScores(null, req)
        const { resource: current } = await scoreContainer
          .item(scores[2].id, scores[2].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({ count: 1 })
        expect(current).toStrictEqual(resource)
      })

      test('upserts world record, area top and personal best if user is public', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        mocked(musicDataToScoreList).mockReturnValueOnce([
          {
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: 'PARANOiA',
            playStyle: 1,
            difficulty: 0,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
          },
          {
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: 'PARANOiA',
            playStyle: 1,
            difficulty: 1,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
          },
        ])
        req.body = { type: 'eagate_music_data', body: '' }
        const { resource: previousWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: previousAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Act
        const result = await importScores(null, req)
        const { resource: currentWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: currentAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({ count: 2 })
        expect(currentWorldRecord).not.toStrictEqual(previousWorldRecord)
        expect(currentAreaTop).not.toStrictEqual(previousAreaTop)

        // Cleanup
        await scoreContainer
          .item(
            `${publicUser.id}-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-1`,
            publicUser.id
          )
          .delete()
        await scoreContainer
          .item(`0-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-1`, '0')
          .delete()
        await scoreContainer
          .item(`13-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-1`, '13')
          .delete()
      })

      test('upserts world record and personal best if user is public and area is 0', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: areaHiddenUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(areaHiddenUser)
        mocked(musicDataToScoreList).mockReturnValueOnce([
          {
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: 'PARANOiA',
            playStyle: 1,
            difficulty: 0,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
          },
          {
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: 'PARANOiA',
            playStyle: 1,
            difficulty: 1,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
          },
        ])
        req.body = { type: 'eagate_music_data', body: '' }
        const { resource: previousWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()

        // Act
        const result = await importScores(null, req)
        const { resource: currentWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({ count: 2 })
        expect(currentWorldRecord).not.toStrictEqual(previousWorldRecord)

        // Cleanup
        await scoreContainer
          .item(
            `${areaHiddenUser.id}-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-1`,
            areaHiddenUser.id
          )
          .delete()
        await scoreContainer
          .item(`0-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-1`, '0')
          .delete()
      })

      test('upserts personal best only if user is private', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: privateUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
        mocked(musicDataToScoreList).mockReturnValueOnce([
          {
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: 'PARANOiA',
            playStyle: 1,
            difficulty: 0,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
          },
          {
            songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
            songName: 'PARANOiA',
            playStyle: 1,
            difficulty: 1,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
          },
        ])
        req.body = { type: 'eagate_music_data', body: '' }
        const { resource: previousWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: previousAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Act
        const result = await importScores(null, req)
        const { resource: currentWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: currentAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({ count: 2 })
        expect(currentWorldRecord).toStrictEqual(previousWorldRecord)
        expect(currentAreaTop).toStrictEqual(previousAreaTop)

        // Cleanup
        await scoreContainer
          .item(
            `${privateUser.id}-06loOQ0DQb0DqbOibl6qO81qlIdoP9DI-1-1`,
            privateUser.id
          )
          .delete()
      })

      afterEach(async () => {
        await Promise.all(
          scores.map(s => scoreContainer.item(s.id, s.userId).delete())
        )
      })
    }
  )
})
