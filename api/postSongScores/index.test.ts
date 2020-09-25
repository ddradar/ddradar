import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { SongSchema } from '../db'
import { fetchScore, ScoreSchema } from '../db/scores'
import type { Score } from '../score'
import postSongScores from '.'

jest.mock('../auth')
jest.mock('../db/scores', () => ({
  ...jest.genMockFromModule<Record<string, unknown>>('../db/scores'),
  DanceLevelList: jest.requireActual('../db/scores').DanceLevelList,
}))

describe('POST /api/v1/scores', () => {
  const req: Pick<HttpRequest, 'headers' | 'body'> = { headers: {}, body: {} }
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
    name: 'AFRO',
    area: 13,
    isPublic: true,
  } as const
  const areaHiddenUser = {
    id: 'area_hidden_user',
    name: 'ZERO',
    area: 0,
    isPublic: true,
  } as const
  const privateUser = {
    id: 'private_user',
    name: 'EMI',
    area: 13,
    isPublic: false,
  } as const

  const scoreTemplate = {
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
  const scores: Record<string, ScoreSchema> = {
    '0': {
      userId: '0',
      userName: '0',
      isPublic: false,
      ...scoreTemplate,
      score: 999620, // P:38
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 376,
    },
    '13': {
      userId: '13',
      userName: '13',
      isPublic: false,
      ...scoreTemplate,
      score: 996720, // P:37, Gr:1
      clearLamp: 5,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 375,
    },
    public_user: {
      userId: publicUser.id,
      userName: publicUser.name,
      isPublic: publicUser.isPublic,
      ...scoreTemplate,
    },
    area_hidden_user: {
      userId: areaHiddenUser.id,
      userName: areaHiddenUser.name,
      isPublic: areaHiddenUser.isPublic,
      ...scoreTemplate,
    },
    private_user: {
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
      ...scoreTemplate,
    },
  }

  const score: Score = {
    score: 1000000,
    clearLamp: 7,
    maxCombo: 138,
    rank: 'AAA',
    exScore: 414,
  }

  beforeAll(async () => {
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userId: 'some_user',
      userDetails: 'some_user',
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(fetchScore).mockImplementation(
      (userId, _1, playStyle, difficulty) => {
        if (playStyle !== 1 || difficulty !== 0) return Promise.resolve(null)
        return Promise.resolve(scores[userId] ?? null)
      }
    )
  })

  beforeEach(() => (req.body = {}))

  test('returns "401 Unauthenticated" if no authentication', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(401)
  })

  test.each([
    undefined,
    [],
    [{ score: 50000000 }],
    [{ ...score }],
    [{ ...score, playStyle: 'SINGLE', difficulty: 'BEGINNER' }],
    [{ ...score, playStyle: 1, difficulty: 5 }],
    [{ ...score, playStyle: 3, difficulty: 0 }],
  ])('returns "400 Bad Request" if body is %p', async body => {
    // Arrange
    req.body = body

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    req.body = [{ ...score, playStyle: 1, difficulty: 0 }]

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    req.body = [{ playStyle: 1, difficulty: 0, ...score }]

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test.each([
    [2, 0],
    [1, 4],
  ])(
    `/%s returns "404 Not Found" if body is [{ playStyle: %i, difficulty: %i }]`,
    async (playStyle, difficulty) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      req.body = [{ ...score, playStyle, difficulty }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(404)
    }
  )

  test('/%s returns "400 Bad Request" if body is invalid Score', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    req.body = [
      {
        playStyle: 1,
        difficulty: 0,
        score: 90000,
        clearLamp: 2,
        rank: 'E',
        exScore: 1000,
      },
    ]

    // Act
    const result = await postSongScores(null, req, [song])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test(`inserts World & Area Top`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    const expected = {
      playStyle: 1,
      difficulty: 1,
      level: 8,
      score: 999700,
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 264,
      exScore: 762,
    }
    req.body = [{ ...expected }]

    // Act
    const result = await postSongScores(null, req, [song])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual([
      {
        ...scores[publicUser.id],
        ...expected,
      },
    ])
    expect(result.documents?.[1].score).toBe(expected.score)
    expect(result.documents?.[2].score).toBe(expected.score)
  })

  test.each([
    [950000, 2],
    [999510, 6],
    [1000000, 7],
  ])(
    'inserts { score: %i, clearLamp: %i } for world top',
    async (topScore, clearLamp) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      const expected = {
        playStyle: 1,
        difficulty: 1,
        level: 8,
        score: 900000,
        clearLamp: 4,
        rank: 'AA',
        maxCombo: 264,
        exScore: 700,
      }
      req.body = [{ ...expected, topScore }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual([
        {
          ...scores[publicUser.id],
          ...expected,
        },
      ])
      expect(result.documents?.[1].score).toBe(topScore)
      expect(result.documents?.[1].clearLamp).toBe(clearLamp)
      expect(result.documents?.[2].score).toBe(expected.score)
    }
  )

  test.each([
    [
      0,
      {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        score: 890000,
        clearLamp: 4,
        rank: 'AA-',
        exScore: 200,
        maxCombo: 138,
      },
    ],
    [
      2,
      {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        score: 999620,
        clearLamp: 6,
        rank: 'AAA',
        exScore: 376,
      },
    ],
  ])(
    `/${song.id} returns "200 OK" with JSON and documents[%i] if score is %p`,
    async (length, score) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      req.body = [{ ...score }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual([
        {
          ...scores[publicUser.id],
          ...score,
        },
      ])
      expect(result.documents).toHaveLength(length)
    }
  )

  test.each([
    [1, privateUser],
    [2, areaHiddenUser],
    [3, publicUser],
  ])(
    `/${song.id} returns "200 OK" with JSON and documents[%i] if user is %p and score is MFC`,
    async (length, user) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(user)
      const expected = {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        ...score,
      }
      req.body = [{ ...expected }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual([
        { ...scores[user.id], ...expected },
      ])
      expect(result.documents).toHaveLength(length)
    }
  )

  test('/%s updates World Top if topScore is defined', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    const expected = {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      ...score,
    }
    req.body = [{ ...expected, topScore: 999700 }]

    // Act
    const result = await postSongScores(null, req, [song])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual([
      {
        ...scores[privateUser.id],
        ...expected,
      },
    ])
    expect(result.documents?.[1].score).toBe(999700)
    expect(result.documents?.[1].exScore).toBe(384)
  })
})
