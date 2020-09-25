import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { ClientPrincipal, getClientPrincipal, getLoginUserInfo } from '../auth'
import { ScoreSchema, SongSchema } from '../db'
import postChartScore from '.'

jest.mock('../auth')

describe('POST /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'body'>
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
  const clientPrincipal: Pick<
    ClientPrincipal,
    'identityProvider' | 'userRoles' | 'userDetails'
  > = {
    identityProvider: 'github',
    userDetails: 'github_account',
    userRoles: ['anonymous', 'authenticated'],
  }
  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {} }
    mocked(getClientPrincipal).mockReturnValue({
      ...clientPrincipal,
      userId: 'some_user',
    })
  })

  test('returns "401 Unauthenticated" if no authentication', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(401)
  })

  test('returns "400 Bad Request" if body is not Score', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = {}

    // Act
    const result = await postChartScore(context, req, [], [])

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
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce({
      ...clientPrincipal,
      userId: publicUser.loginId,
    })
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = { score: 1000000, rank: 'AAA', clearLamp: 7 }

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test.each([
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
      const result = await postChartScore(context, req, [song], [])

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
    const result = await postChartScore(context, req, [song], [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

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
  const score = {
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[0].playStyle,
    difficulty: song.charts[0].difficulty,
    level: song.charts[0].level,
    score: 970630, // P:28, Gr:10
    clearLamp: 5,
    rank: 'AA+',
    maxCombo: 138,
    exScore: 366,
  } as const
  const scores: ScoreSchema[] = [
    {
      ...score,
      userId: '0',
      userName: '0',
      isPublic: false,
      score: 999620, // P:38
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 376,
    },
    {
      ...score,
      userId: '13',
      userName: '13',
      isPublic: false,
      score: 996720, // P:37, Gr:1
      clearLamp: 5,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 375,
    },
    {
      ...score,
      userId: publicUser.id,
      userName: publicUser.name,
      isPublic: publicUser.isPublic,
    },
    {
      ...score,
      userId: areaHiddenUser.id,
      userName: areaHiddenUser.name,
      isPublic: areaHiddenUser.isPublic,
    },
    {
      ...score,
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
    },
  ]

  test('inserts World & Area Top', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce({
      ...clientPrincipal,
      userId: publicUser.loginId,
    })
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.songId = song.id
    context.bindingData.playStyle = song.charts[1].playStyle
    context.bindingData.difficulty = song.charts[1].difficulty
    req.body = { score: 900000, clearLamp: 3, rank: 'AA' }

    // Act
    const result = await postChartScore(context, req, [song], [])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...req.body,
      userId: publicUser.id,
      userName: publicUser.name,
      isPublic: publicUser.isPublic,
      songId: song.id,
      songName: song.name,
      playStyle: song.charts[0].playStyle,
      difficulty: song.charts[1].difficulty,
      level: song.charts[1].level,
    })
    expect(result.documents).toHaveLength(3)
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
    const result = await postChartScore(context, req, [song], scores)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...scores[2],
      ...expected,
    })
    expect(result.documents).toStrictEqual([{ ...scores[2], ...expected }])
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
    req.body = {
      score: 890000,
      clearLamp: 4,
      rank: 'AA-',
      exScore: 200,
      maxCombo: 138,
    }
    const expected = { ...scores[2], ...req.body }

    // Act
    const result = await postChartScore(context, req, [song], scores)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(expected)
    expect(result.documents).toStrictEqual([expected])
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
    const result = await postChartScore(context, req, [song], scores)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...scores[2],
      ...expected,
    })
    expect(result.documents).toStrictEqual([
      { ...scores[2], ...expected },
      { ...scores[1], ...expected },
    ])
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
    const result = await postChartScore(context, req, [song], scores)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...scores[2],
      ...expected,
    })
    expect(result.documents).toStrictEqual([
      { ...scores[2], ...expected },
      { ...scores[0], ...expected },
      { ...scores[1], ...expected },
    ])
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
    const result = await postChartScore(context, req, [song], scores)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...scores[3],
      ...expected,
    })
    expect(result.documents).toStrictEqual([
      { ...scores[3], ...expected },
      { ...scores[0], ...expected },
    ])
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
    const result = await postChartScore(context, req, [song], scores)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...scores[4],
      ...expected,
    })
    expect(result.documents).toStrictEqual([{ ...scores[4], ...expected }])
  })
})
