import { HttpRequest, InvocationContext } from '@azure/functions'
import { Score, ScoreSchema } from '@ddradar/core'
import {
  areaHiddenUser,
  noPasswordUser,
  privateUser,
  publicUser,
  testScores,
  testSongData as song,
} from '@ddradar/core/test/data'
import { fetchScore } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { handler } from '../../src/functions/postSongScores'

vi.mock('@ddradar/db')

describe('/functions/postSongScores.ts', () => {
  const json = vi.fn()
  const req: Pick<HttpRequest, 'json'> = { json }
  const password = publicUser.password

  const scores = new Map(testScores.map(d => [d.userId, d]))

  const score: Score = {
    score: 1000000,
    clearLamp: 7,
    maxCombo: song.charts[0].notes,
    rank: 'AAA',
    exScore: song.charts[0].notes * 3,
  }

  beforeAll(async () => {
    vi.mocked(fetchScore).mockImplementation(
      (userId, _1, playStyle, difficulty) => {
        if (playStyle !== 1 || difficulty !== 0) return Promise.resolve(null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Promise.resolve((scores.get(userId) as any) ?? null)
      }
    )
  })
  beforeEach(() => json.mockClear())

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    json.mockResolvedValue({
      password,
      scores: [{ ...score, playStyle: 1, difficulty: 0 }],
    })
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [])
    ctx.extraInputs.set('users', [])

    // Act
    const result = await handler(req, ctx)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "404 Not Found" if wrong password', async () => {
    // Arrange
    json.mockResolvedValue({
      password: 'wrong',
      scores: [{ ...score, playStyle: 1, difficulty: 0 }],
    })
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [])
    ctx.extraInputs.set('users', [publicUser])

    // Act
    const result = await handler(req, ctx)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "404 Not Found" if no password user', async () => {
    // Arrange
    json.mockResolvedValue({
      password: '',
      scores: [{ ...score, playStyle: 1, difficulty: 0 }],
    })
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [])
    ctx.extraInputs.set('users', [noPasswordUser])

    // Act
    const result = await handler(req, ctx)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange
    json.mockResolvedValue({
      password,
      scores: [{ playStyle: 1, difficulty: 0, ...score }],
    })
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [])
    ctx.extraInputs.set('users', [publicUser])

    // Act
    const result = await handler(req, ctx)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each([
    [2, 0],
    [1, 4],
  ])(
    `/${song.id} returns "404 Not Found" if body is [{ playStyle: %i, difficulty: %i }]`,
    async (playStyle, difficulty) => {
      // Arrange
      json.mockResolvedValue({
        password,
        scores: [{ ...score, playStyle, difficulty }],
      })
      const ctx = new InvocationContext()
      ctx.extraInputs.set('songs', [song])
      ctx.extraInputs.set('users', [publicUser])

      // Act
      const result = await handler(req, ctx)

      // Assert
      expect(result.status).toBe(404)
    }
  )

  test.each([
    undefined,
    {},
    { password: 1000 },
    { password, scores: [] },
    { password, scores: [{ score: 50000000 }] },
    {
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
    },
  ])(`/${song.id} returns "400 Bad Request" if body is %o`, async body => {
    // Arrange
    json.mockResolvedValue(body)
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [song])
    ctx.extraInputs.set('users', [publicUser])

    // Act
    const result = await handler(req, ctx)

    // Assert
    expect(result.status).toBe(400)
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
      json.mockResolvedValue({ password, scores: [{ ...expected, topScore }] })
      const ctx = new InvocationContext()
      ctx.extraInputs.set('songs', [song])
      ctx.extraInputs.set('users', [publicUser])

      // Act
      const result = await handler(req, ctx)

      // Assert
      expect(result.status).toBe(200)
      const documents = ctx.extraOutputs.get('documents') as ScoreSchema[]
      expect(documents?.[1].score).toBe(topScore)
      expect(documents?.[1].clearLamp).toBe(clearLamp)
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
    `/${song.id} returns "200 OK" with JSON and documents[%i] if score is %o`,
    async (length, score) => {
      // Arrange
      json.mockResolvedValue({ password, scores: [{ ...score }] })
      const ctx = new InvocationContext()
      ctx.extraInputs.set('songs', [song])
      ctx.extraInputs.set('users', [publicUser])

      // Act
      const result = await handler(req, ctx)

      // Assert
      expect(result.status).toBe(200)
      const documents = ctx.extraOutputs.get('documents') as []
      expect(documents).toHaveLength(length)
    }
  )

  test.each([
    [2, privateUser],
    [4, areaHiddenUser],
    [6, publicUser],
  ])(
    `/${song.id} returns "200 OK" with JSON and documents[%i] if user is %o and score is MFC`,
    async (length, user) => {
      // Arrange
      const expected = {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        ...score,
      }
      json.mockResolvedValue({ password, scores: [{ ...expected }] })
      const ctx = new InvocationContext()
      ctx.extraInputs.set('songs', [song])
      ctx.extraInputs.set('users', [user])

      // Act
      const result = await handler(req, ctx)

      // Assert
      expect(result.status).toBe(200)
      const documents = ctx.extraOutputs.get('documents') as []
      expect(documents).toHaveLength(length)
    }
  )

  test(`/${song.id} updates World Top if topScore is defined`, async () => {
    // Arrange
    const expected = {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      ...score,
    }
    json.mockResolvedValue({
      password,
      scores: [{ ...expected, topScore: 999700 }],
    })
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [song])
    ctx.extraInputs.set('users', [privateUser])

    // Act
    const result = await handler(req, ctx)

    // Assert
    expect(result.status).toBe(200)
    const documents = ctx.extraOutputs.get('documents') as []
    expect(documents).toHaveLength(4)
  })
})
