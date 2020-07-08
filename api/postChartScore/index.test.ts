import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { ClientPrincipal, getClientPrincipal, getLoginUserInfo } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import { ScoreSchema, SongSchema } from '../db'
import postChartScore from '.'

jest.mock('../auth')

describe('POST /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'body'>

  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {} }
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
    const result = await postChartScore(context, req)

    // Assert
    expect(result.status).toBe(401)
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await postChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each(['', 'foo'])('/%s/1/0 returns "404 Not Found"', async songId => {
    // Arrange
    context.bindingData.songId = songId
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0

    // Act
    const result = await postChartScore(context, req)

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
      const result = await postChartScore(context, req)

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
      const result = await postChartScore(context, req)

      // Assert
      expect(result.status).toBe(404)
    }
  )

  test.each([
    undefined,
    null,
    1000000,
    '',
    true,
    { score: '1000000' },
    { score: -5 },
    { score: 50000000 },
    { clearLamp: 'MFC' },
    { clearLamp: -1 },
    { clearLamp: 10 },
    { exScore: false },
    { maxCombo: '200' },
    { rank: 1 },
    { rank: '-' },
  ])('returns "400 Bad Request" if body is %p', async body => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = body

    // Act
    const result = await postChartScore(context, req)

    // Assert
    expect(result.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = { score: 1000000 }

    // Act
    const result = await postChartScore(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const songContainer = getContainer('Songs')
      const userContainer = getContainer('Users')
      const scoreContainer = getContainer('Scores')
      const song: SongSchema = {
        id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
        name: 'PARANOiA',
        nameKana: 'PARANOIA',
        nameIndex: 25,
        artist: '180',
        series: 'DDR 1st',
        minBPM: 180,
        maxBPM: 180,
        charts: [
          {
            playStyle: 1,
            difficulty: 0,
            level: 4,
            notes: 138,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 29,
            voltage: 22,
            air: 5,
            freeze: 0,
            chaos: 0,
          },
          {
            playStyle: 1,
            difficulty: 1,
            level: 8,
            notes: 264,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 56,
            voltage: 44,
            air: 18,
            freeze: 0,
            chaos: 4,
          },
        ],
      }
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
          id: `0-${song.id}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
          userId: '0',
          userName: '0',
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          score: 999620, // P:38
          clearLamp: 6,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 376,
          isPublic: false,
        },
        {
          id: `13-${song.id}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
          userId: '13',
          userName: '13',
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          score: 996720, // P:37, Gr:1
          clearLamp: 5,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 375,
          isPublic: false,
        },
        {
          id: `${publicUser.id}-${song.id}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
          userId: publicUser.id,
          userName: publicUser.name,
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          score: 970630, // P:28, Gr:10
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
          isPublic: publicUser.isPublic,
        },
        {
          id: `${areaHiddenUser.id}-${song.id}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
          userId: areaHiddenUser.id,
          userName: areaHiddenUser.name,
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          score: 970630, // P:28, Gr:10
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
          isPublic: areaHiddenUser.isPublic,
        },
        {
          id: `${privateUser.id}-${song.id}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
          userId: privateUser.id,
          userName: privateUser.name,
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
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

      beforeAll(async () => {
        await songContainer.items.create(song)
        await Promise.all(
          [publicUser, areaHiddenUser, privateUser].map(u =>
            userContainer.items.create(u)
          )
        )
      })

      beforeEach(async () => {
        await Promise.all(scores.map(s => scoreContainer.items.create(s)))
      })

      test.each([
        ['00000000000000000000000000000000', 1, 0],
        ['06loOQ0DQb0DqbOibl6qO81qlIdoP9DI', 2, 0],
        ['06loOQ0DQb0DqbOibl6qO81qlIdoP9DI', 1, 4],
      ])(
        '/%s/%i/%i returns "404 Not Found"',
        async (songId, playStyle, difficulty) => {
          // Arrange
          mocked(getClientPrincipal).mockReturnValueOnce({
            ...clientPrincipal,
            userId: publicUser.loginId,
          })
          mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
          context.bindingData.songId = songId
          context.bindingData.playStyle = playStyle
          context.bindingData.difficulty = difficulty
          req.body = { score: 1000000 }

          // Act
          const result = await postChartScore(context, req)

          // Assert
          expect(result.status).toBe(404)
        }
      )

      test.each([{ exScore: 1000 }, { rank: 'AA' }, { clearLamp: 4 }])(
        'returns "400 Bad Request" if body is %p',
        async score => {
          // Arrange
          mocked(getClientPrincipal).mockReturnValueOnce({
            ...clientPrincipal,
            userId: publicUser.loginId,
          })
          mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
          context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
          context.bindingData.playStyle = 1
          context.bindingData.difficulty = 0
          req.body = score

          // Act
          const result = await postChartScore(context, req)

          // Assert
          expect(result.status).toBe(400)
        }
      )

      test.each([
        { score: 900000 },
        { score: 890000, clearLamp: 4 },
        { score: 880000, maxCombo: 58 },
        { score: 890000, exScore: 300 },
        {
          score: 970630,
          clearLamp: 5,
          rank: 'AA+',
          maxCombo: 138,
          exScore: 366,
        },
      ])('does not upsert score if body is %p', async score => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0
        req.body = score
        const { resource } = await scoreContainer
          .item(scores[2].id, scores[2].userId)
          .read<ScoreSchema>()

        // Act
        const result = await postChartScore(context, req)
        const { resource: current } = await scoreContainer
          .item(scores[2].id, scores[2].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(scores[2])
        expect(current).toStrictEqual(resource)
      })

      test('upserts world record, area top and personal best if user is public', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0
        req.body = { score: 1000000 }
        const { resource: previousWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: previousAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Act
        const result = await postChartScore(context, req)
        const { resource: currentWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: currentAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({
          ...scores[2],
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          exScore: 414,
        })
        expect(currentWorldRecord).not.toStrictEqual(previousWorldRecord)
        expect(currentAreaTop).not.toStrictEqual(previousAreaTop)
      })

      test('upserts world record and personal best if user is public and area is 0', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: areaHiddenUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(areaHiddenUser)
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0
        req.body = { score: 1000000 }
        const { resource: previousWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()

        // Act
        const result = await postChartScore(context, req)
        const { resource: currentWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({
          ...scores[3],
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          exScore: 414,
        })
        expect(currentWorldRecord).not.toStrictEqual(previousWorldRecord)
      })

      test('upserts personal best only if user is private', async () => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: privateUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
        context.bindingData.songId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
        context.bindingData.playStyle = 1
        context.bindingData.difficulty = 0
        req.body = { score: 1000000 }
        const { resource: previousWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: previousAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Act
        const result = await postChartScore(context, req)
        const { resource: currentWorldRecord } = await scoreContainer
          .item(scores[0].id, scores[0].userId)
          .read<ScoreSchema>()
        const { resource: currentAreaTop } = await scoreContainer
          .item(scores[1].id, scores[1].userId)
          .read<ScoreSchema>()

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({
          ...scores[4],
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          exScore: 414,
        })
        expect(currentWorldRecord).toStrictEqual(previousWorldRecord)
        expect(currentAreaTop).toStrictEqual(previousAreaTop)
      })

      afterEach(async () => {
        await Promise.all(
          scores.map(s => scoreContainer.item(s.id, s.userId).delete())
        )
      })

      afterAll(async () => {
        await songContainer.item(song.id, song.nameIndex).delete()
        await Promise.all(
          [publicUser, areaHiddenUser, privateUser].map(u =>
            userContainer.item(u.id, u.id).delete()
          )
        )
      })
    }
  )
})
