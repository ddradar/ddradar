import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { ClientPrincipal, getClientPrincipal, getLoginUserInfo } from '../auth'
import { canConnectDB, getContainer, ScoreSchema } from '../db'
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
    expect(result.httpResponse.status).toBe(401)
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await postChartScore(context, req)

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test.each(['', 'foo'])('/%s/1/0 returns "404 Not Found"', async songId => {
    // Arrange
    context.bindingData.songId = songId
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0

    // Act
    const result = await postChartScore(context, req)

    // Assert
    expect(result.httpResponse.status).toBe(404)
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
      expect(result.httpResponse.status).toBe(404)
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
      expect(result.httpResponse.status).toBe(404)
    }
  )

  test.each([
    undefined,
    null,
    1000000,
    '',
    true,
    {},
    { score: 50000000 },
    { score: 1000000, clearLamp: 'MFC', rank: 'AAA' },
    { score: 1000000, clearLamp: 7, maxCombo: '200', rank: 'AAA' },
    { score: 0, clearLamp: 0, rank: '-' },
    { score: 950000, rank: 'AA' },
  ])('returns "400 Bad Request" if body is %p', async body => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = body

    // Act
    const result = await postChartScore(context, req)

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = { score: 1000000, rank: 'AAA', clearLamp: 7 }

    // Act
    const result = await postChartScore(context, req)

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  describeIf(canConnectDB)('Cosmos DB integration test', () => {
    const songContainer = getContainer('Songs')
    const scoreContainer = getContainer('Scores')
    const song = {
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
    } as const
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
    const worldScore: ScoreSchema = {
      userId: '0',
      userName: '0',
      songId: song.id,
      songName: song.name,
      playStyle: song.charts[0].playStyle,
      difficulty: song.charts[0].difficulty,
      level: song.charts[0].level,
      score: 999620, // P:38
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 376,
      isPublic: false,
    }
    const areaScore: ScoreSchema = {
      ...worldScore,
      userId: '13',
      userName: '13',
      score: 996720, // P:37, Gr:1
      clearLamp: 5,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 375,
    }
    const publicUserScore: ScoreSchema = {
      ...worldScore,
      userId: publicUser.id,
      userName: publicUser.name,
      score: 970630, // P:28, Gr:10
      clearLamp: 5,
      rank: 'AA+',
      maxCombo: 138,
      exScore: 366,
      isPublic: publicUser.isPublic,
    }
    const areaHiddenUserScore: ScoreSchema = {
      ...publicUserScore,
      userId: areaHiddenUser.id,
      userName: areaHiddenUser.name,
      isPublic: areaHiddenUser.isPublic,
    }
    const privateUserScore: ScoreSchema = {
      ...publicUserScore,
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
    }
    const clientPrincipal: Pick<
      ClientPrincipal,
      'identityProvider' | 'userRoles' | 'userDetails'
    > = {
      identityProvider: 'github',
      userDetails: 'github_account',
      userRoles: ['anonymous', 'authenticated'],
    }
    const addId = (s: ScoreSchema) => ({
      ...s,
      id: `${s.userId}-${s.songId}-${s.playStyle}-${s.difficulty}`,
    })

    beforeAll(async () => {
      await songContainer.items.create(song)
      await Promise.all(
        [
          addId(worldScore),
          addId(areaScore),
          addId(publicUserScore),
          addId(areaHiddenUserScore),
          addId(privateUserScore),
        ].map(s => scoreContainer.items.create(s))
      )
    })
    afterAll(async () => {
      await songContainer.item(song.id, song.nameIndex).delete()
      await Promise.all(
        [
          addId(worldScore),
          addId(areaScore),
          addId(publicUserScore),
          addId(areaHiddenUserScore),
          addId(privateUserScore),
        ].map(s => scoreContainer.item(s.id, s.userId).delete())
      )
    })

    test.each([
      ['00000000000000000000000000000000', 1, 0],
      [song.id, 2, 0],
      [song.id, 1, 4],
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
        req.body = { score: 1000000, rank: 'AAA', clearLamp: 7 }

        // Act
        const result = await postChartScore(context, req)

        // Assert
        expect(result.httpResponse.status).toBe(404)
      }
    )

    test('returns "400 Bad Request" if body is invalid Score', async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        ...clientPrincipal,
        userId: publicUser.loginId,
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = { score: 90000, clearLamp: 2, rank: 'E', exScore: 1000 }

      // Act
      const result = await postChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(400)
    })

    test('inserts World & Area Top', async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        ...clientPrincipal,
        userId: publicUser.loginId,
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = 1
      context.bindingData.difficulty = 1
      req.body = {
        score: 999700,
        clearLamp: 6,
        rank: 'AAA',
        maxCombo: 264,
        exScore: 762,
      }

      // Act
      const result = await postChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...publicUserScore,
        ...req.body,
        difficulty: song.charts[1].difficulty,
        level: song.charts[1].level,
      })
      expect(result.userScore).toStrictEqual({
        ...publicUserScore,
        ...req.body,
        difficulty: song.charts[1].difficulty,
        level: song.charts[1].level,
      })
      expect(result.areaScore).toStrictEqual({
        ...areaScore,
        ...req.body,
        difficulty: song.charts[1].difficulty,
        level: song.charts[1].level,
      })
      expect(result.worldScore).toStrictEqual({
        ...worldScore,
        ...req.body,
        difficulty: song.charts[1].difficulty,
        level: song.charts[1].level,
      })
    })

    test('does not update World & Area Top if score is less than them', async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        ...clientPrincipal,
        userId: publicUser.loginId,
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = { score: 890000, clearLamp: 4, rank: 'AA-', exScore: 200 }
      const expected = { ...req.body, maxCombo: 138 }

      // Act
      const result = await postChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...publicUserScore,
        ...expected,
      })
      expect(result.userScore).toStrictEqual({
        ...publicUserScore,
        ...expected,
      })
      expect(result.areaScore).toBeUndefined()
      expect(result.worldScore).toBeUndefined()
    })

    test('updates Area Top if user is public and score is greater than it', async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        ...clientPrincipal,
        userId: publicUser.loginId,
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = { score: 999620, clearLamp: 6, rank: 'AAA', exScore: 376 }
      const expected = { ...req.body, maxCombo: 138 }

      // Act
      const result = await postChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...publicUserScore,
        ...expected,
      })
      expect(result.userScore).toStrictEqual({
        ...publicUserScore,
        ...expected,
      })
      expect(result.areaScore).toStrictEqual({
        ...areaScore,
        ...expected,
      })
      expect(result.worldScore).toBeUndefined()
    })

    test('updates World & Area Top if user is public and score is greater than them', async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        ...clientPrincipal,
        userId: publicUser.loginId,
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = { score: 1000000, clearLamp: 7, rank: 'AAA' }
      const expected = { ...req.body, maxCombo: 138, exScore: 414 }

      // Act
      const result = await postChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...publicUserScore,
        ...expected,
      })
      expect(result.userScore).toStrictEqual({
        ...publicUserScore,
        ...expected,
      })
      expect(result.areaScore).toStrictEqual({
        ...areaScore,
        ...expected,
      })
      expect(result.worldScore).toStrictEqual({
        ...worldScore,
        ...expected,
      })
    })

    test('updates World Top if user is public and area is 0', async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        ...clientPrincipal,
        userId: areaHiddenUser.loginId,
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(areaHiddenUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = { score: 1000000, clearLamp: 7, rank: 'AAA' }
      const expected = { ...req.body, maxCombo: 138, exScore: 414 }

      // Act
      const result = await postChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...areaHiddenUserScore,
        ...expected,
      })
      expect(result.userScore).toStrictEqual({
        ...areaHiddenUserScore,
        ...expected,
      })
      expect(result.areaScore).toBeUndefined()
      expect(result.worldScore).toStrictEqual({
        ...worldScore,
        ...expected,
      })
    })

    test('updates personal best only if user is private', async () => {
      // Arrange
      mocked(getClientPrincipal).mockReturnValueOnce({
        ...clientPrincipal,
        userId: privateUser.loginId,
      })
      mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = { score: 1000000, clearLamp: 7, rank: 'AAA' }
      const expected = { ...req.body, maxCombo: 138, exScore: 414 }

      // Act
      const result = await postChartScore(context, req)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...privateUserScore,
        ...expected,
      })
      expect(result.userScore).toStrictEqual({
        ...privateUserScore,
        ...expected,
      })
      expect(result.areaScore).toBeUndefined()
      expect(result.worldScore).toBeUndefined()
    })
  })
})
