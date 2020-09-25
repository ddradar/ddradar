import { canConnectDB, getContainer } from '../../db'
import { fetchChartScores, fetchScore, ScoreSchema } from '../../db/scores'
import { describeIf } from '../util'

describe('/db/scores.ts', () => {
  describeIf(canConnectDB)('Cosmos DB integration test', () => {
    const user = {
      id: 'private_user',
      name: 'EMI',
      area: 13,
      isPublic: false,
    } as const
    const chart = {
      songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      songName: 'PARANOiA',
      playStyle: 1,
      difficulty: 0,
      level: 4,
    } as const
    const scores: ScoreSchema[] = [
      {
        userId: '0',
        userName: '0',
        ...chart,
        score: 1000000,
        clearLamp: 7,
        rank: 'AAA',
        isPublic: false,
      },
      {
        userId: '13',
        userName: '13',
        ...chart,
        score: 999980,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: false,
      },
      {
        userId: 'public_user',
        userName: 'AFRO',
        ...chart,
        score: 999960,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: true,
      },
      {
        userId: user.id,
        userName: user.name,
        ...chart,
        score: 999900,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: user.isPublic,
      },
      {
        userId: '0',
        userName: '0',
        ...chart,
        difficulty: 1,
        level: 8,
        score: 1000000,
        clearLamp: 7,
        rank: 'AAA',
        isPublic: false,
      },
      {
        userId: user.id,
        userName: user.name,
        ...chart,
        playStyle: 2,
        difficulty: 1,
        level: 8,
        score: 999900,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: user.isPublic,
      },
      {
        userId: 'public_user',
        userName: 'AFRO',
        ...chart,
        playStyle: 2,
        difficulty: 2,
        level: 8,
        score: 999900,
        clearLamp: 6,
        rank: 'AAA',
        isPublic: true,
      },
    ]
    const addId = (s: ScoreSchema) => ({
      ...s,
      id: `${s.userId}-${s.songId}-${s.playStyle}-${s.difficulty}`,
    })
    const removeIsPublic = (s: ScoreSchema) => {
      const result: Omit<ScoreSchema, 'isPublic'> & Partial<ScoreSchema> = {
        ...s,
      }
      delete result.isPublic
      return result
    }

    beforeAll(async () => {
      await Promise.all(
        scores.map(s => getContainer('Scores').items.create(addId(s)))
      )
    })
    afterAll(async () => {
      await Promise.all(
        scores
          .map(s => addId(s))
          .map(s => getContainer('Scores').item(s.id, s.userId).delete())
      )
    })

    describe('fetchScore', () => {
      test.each([
        ['', '', 1, 4] as const,
        ['1', chart.songId, chart.playStyle, chart.difficulty] as const,
        [user.id, 'foo', chart.playStyle, chart.difficulty] as const,
        [user.id, chart.songId, 2, chart.difficulty] as const,
        [user.id, chart.songId, chart.playStyle, 1] as const,
      ])(
        '("%s", "%s", %i, %i) returns null',
        async (userId, songId, playStyle, difficulty) => {
          await expect(
            fetchScore(userId, songId, playStyle, difficulty)
          ).resolves.toBeNull()
        }
      )
      test.each(
        scores.map(
          score =>
            [
              score.userId,
              score.songId,
              score.playStyle,
              score.difficulty,
              removeIsPublic(score),
            ] as const
        )
      )(
        '("%s", "%s", %i, %i) returns %p',
        async (userId, songId, playStyle, difficulty, expected) => {
          await expect(
            fetchScore(userId, songId, playStyle, difficulty)
          ).resolves.toStrictEqual(expected)
        }
      )
    })

    describe('fetchChartScores', () => {
      test.each([
        ['foo', 1, 0, undefined, undefined] as const,
        [chart.songId, 2, 1, 'full', { id: 'public_user', area: 0 }] as const,
        [chart.songId, 2, 2, 'medium', null] as const,
      ])(
        '("%s", %i, %i, "%s", %p) returns []',
        async (songId, playStyle, difficulty, scope, user) => {
          await expect(
            fetchChartScores(songId, playStyle, difficulty, scope, user)
          ).resolves.toHaveLength(0)
        }
      )
      test.each([
        [chart.songId, 1, 0, 'full', null, [0, 2]] as const,
        [chart.songId, 1, 0, 'medium', user, [0, 1, 3]] as const,
        [chart.songId, 1, 0, 'full', user, [0, 1, 2, 3]] as const,
      ])(
        '("%s", %i, %i, "%s", %p) returns scores%p',
        async (songId, playStyle, difficulty, scope, user, indexes) => {
          await expect(
            fetchChartScores(songId, playStyle, difficulty, scope, user)
          ).resolves.toStrictEqual(
            (indexes as readonly number[]).map(i => removeIsPublic(scores[i]))
          )
        }
      )
    })
  })
})
