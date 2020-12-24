import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import {
  areaHiddenUser,
  noPasswordUser,
  privateUser,
  publicUser,
  testSongData,
} from '../core/__tests__/data'
import type { ScoreBody } from '../core/api/score'
import type { ScoreSchema } from '../core/db/scores'
import { fetchScore } from '../db/scores'
import postSongScores from '.'

jest.mock('../db/scores')

describe('POST /api/v1/scores', () => {
  const req: Pick<HttpRequest, 'headers' | 'body'> = { headers: {}, body: {} }
  const song = { ...testSongData, isCourse: false }
  const password = publicUser.password

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

  const score: ScoreBody = {
    score: 1000000,
    clearLamp: 7,
    maxCombo: 138,
    rank: 'AAA',
    exScore: 414,
  }

  beforeAll(async () => {
    mocked(fetchScore).mockImplementation(
      (userId, _1, playStyle, difficulty) => {
        if (playStyle !== 1 || difficulty !== 0) return Promise.resolve(null)
        return Promise.resolve(scores[userId] ?? null)
      }
    )
  })

  beforeEach(() => (req.body = {}))

  test.each([
    undefined,
    {},
    { password: 1000 },
    { password, scores: [] },
    { password, scores: [{ score: 50000000 }] },
    { password, scores: [{ ...score }] },
    {
      password,
      scores: [{ ...score, playStyle: 'SINGLE', difficulty: 'BEGINNER' }],
    },
    {
      password,
      scores: [{ ...score, playStyle: 1, difficulty: 5 }],
    },
    {
      password: 'password',
      scores: [{ ...score, playStyle: 3, difficulty: 0 }],
    },
  ])('returns "400 Bad Request" if body is %p', async body => {
    // Arrange
    req.body = body

    // Act
    const result = await postSongScores(null, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    req.body = { password, scores: [{ ...score, playStyle: 1, difficulty: 0 }] }

    // Act
    const result = await postSongScores(null, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if wrong password', async () => {
    // Arrange
    req.body = {
      password: 'wrong',
      scores: [{ ...score, playStyle: 1, difficulty: 0 }],
    }

    // Act
    const result = await postSongScores(null, req, [], [publicUser])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if no password user', async () => {
    // Arrange
    req.body = {
      password: '',
      scores: [{ ...score, playStyle: 1, difficulty: 0 }],
    }

    // Act
    const result = await postSongScores(null, req, [], [noPasswordUser])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange
    req.body = { password, scores: [{ playStyle: 1, difficulty: 0, ...score }] }

    // Act
    const result = await postSongScores(null, req, [], [publicUser])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test.each([
    [2, 0],
    [1, 4],
  ])(
    `/${song.id} returns "404 Not Found" if body is [{ playStyle: %i, difficulty: %i }]`,
    async (playStyle, difficulty) => {
      // Arrange
      req.body = { password, scores: [{ ...score, playStyle, difficulty }] }

      // Act
      const result = await postSongScores(null, req, [song], [publicUser])

      // Assert
      expect(result.httpResponse.status).toBe(404)
    }
  )

  test(`/${song.id} returns "400 Bad Request" if body is invalid Score`, async () => {
    // Arrange
    req.body = {
      password,
      scores: [
        {
          playStyle: 1,
          difficulty: 0,
          score: 90000,
          clearLamp: 2,
          rank: 'E',
          exScore: 1000,
        },
      ],
    }

    // Act
    const result = await postSongScores(null, req, [song], [publicUser])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test(`inserts World & Area Top`, async () => {
    // Arrange
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
    req.body = { password, scores: [{ ...expected }] }

    // Act
    const result = await postSongScores(null, req, [song], [publicUser])

    // Assert
    expect(result.httpResponse.status).toBe(200)
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
      req.body = { password, scores: [{ ...expected, topScore }] }

      // Act
      const result = await postSongScores(null, req, [song], [publicUser])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.documents?.[1].score).toBe(topScore)
      expect(result.documents?.[1].clearLamp).toBe(clearLamp)
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
      4,
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
      req.body = { password, scores: [{ ...score }] }

      // Act
      const result = await postSongScores(null, req, [song], [publicUser])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.documents).toHaveLength(length)
    }
  )

  test.each([
    [2, privateUser],
    [4, areaHiddenUser],
    [6, publicUser],
  ])(
    `/${song.id} returns "200 OK" with JSON and documents[%i] if user is %p and score is MFC`,
    async (length, user) => {
      // Arrange
      const expected = {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        ...score,
      }
      req.body = { password, scores: [{ ...expected }] }

      // Act
      const result = await postSongScores(null, req, [song], [user])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.documents).toHaveLength(length)
    }
  )

  test(`/${song.id} returns "200 OK" with JSON and documents[%i] if course`, async () => {
    // Arrange
    const expected = {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      ...score,
    }
    req.body = { password, scores: [{ ...expected }] }

    // Act
    const result = await postSongScores(
      null,
      req,
      [{ ...song, isCourse: true }],
      [privateUser]
    )

    // Assert
    expect(result.httpResponse.status).toBe(200)
  })

  test(`/${song.id} updates World Top if topScore is defined`, async () => {
    // Arrange
    const expected = {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      ...score,
    }
    req.body = { password, scores: [{ ...expected, topScore: 999700 }] }

    // Act
    const result = await postSongScores(null, req, [song], [privateUser])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.documents).toHaveLength(4)
  })
})
