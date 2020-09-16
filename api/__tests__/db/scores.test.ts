import { getConnectionString, getContainer } from '../../db'
import { fetchChartScores, ScoreSchema } from '../../db/scores'
import { Difficulty } from '../../db/songs'
import type { UserSchema } from '../../db/users'
import { describeIf } from '../util'

describe('/db/scores.ts', () => {
  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      describe('fetchChartScores', () => {
        const userContainer = getContainer('Users')
        const scoreContainer = getContainer('Scores')
        const user: UserSchema = {
          id: 'private_user',
          loginId: 'private_user',
          name: 'EMI',
          area: 13,
          isPublic: false,
        }
        const chart = {
          songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          songName: 'PARANOiA',
          playStyle: 1,
          difficulty: 0,
          level: 4,
        } as const
        const scores: readonly ScoreSchema[] = [
          {
            id: `0-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
            userId: '0',
            userName: '全国トップ',
            ...chart,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
            isPublic: false,
          },
          {
            id: `13-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
            userId: '13',
            userName: '東京都トップ',
            ...chart,
            score: 999980,
            clearLamp: 6,
            rank: 'AAA',
            isPublic: false,
          },
          {
            id: `public_user-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
            userId: 'public_user',
            userName: 'AFRO',
            ...chart,
            score: 999960,
            clearLamp: 6,
            rank: 'AAA',
            isPublic: true,
          },
          {
            id: `${user.id}-${chart.songId}-${chart.playStyle}-${chart.difficulty}`,
            userId: user.id,
            userName: user.name,
            ...chart,
            score: 999900,
            clearLamp: 6,
            rank: 'AAA',
            isPublic: user.isPublic,
          },
          {
            id: `0-${chart.songId}-${chart.playStyle}-1`,
            userId: '0',
            userName: '全国トップ',
            ...chart,
            difficulty: 1,
            level: 8,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
            isPublic: false,
          },
        ] as const
        const score = (i: number) => ({
          userId: scores[i].userId,
          userName: scores[i].userName,
          ...chart,
          score: scores[i].score,
          clearLamp: scores[i].clearLamp,
          rank: scores[i].rank,
        })

        beforeAll(async () => {
          await userContainer.items.create(user)
          await Promise.all(scores.map(s => scoreContainer.items.create(s)))
        })
        afterAll(async () => {
          await userContainer.item(user.id, user.id).delete()
          await Promise.all(
            scores.map(s => scoreContainer.item(s.id, s.userId).delete())
          )
        })

        test.each([
          ['0000', 1, 0, null, 'medium', [] as number[]],
          [chart.songId, 2, 0, null, 'medium', [] as number[]],
          [chart.songId, 1, 4, null, 'medium', [] as number[]],
          [chart.songId, 1, 0, null, 'private', [] as number[]],
          [chart.songId, 1, 0, null, 'medium', [0]],
          [chart.songId, 1, 0, null, 'full', [0, 2]],
          [chart.songId, 1, 0, user, 'private', [3]],
          [chart.songId, 1, 0, user, 'medium', [0, 1, 3]],
          [chart.songId, 1, 0, user, 'full', [0, 1, 2, 3]],
        ])(
          `("%s", %i, %i, %p, "%s") returns %p`,
          async (songId, playStyle, difficulty, user, scope, expected) => {
            // Arrange - Act
            const result = await fetchChartScores(
              songId,
              playStyle as 1 | 2,
              difficulty as Difficulty,
              user,
              scope as 'private' | 'medium' | 'full'
            )

            // Assert
            expect(result).toStrictEqual(expected.map(i => score(i)))
          }
        )
      })
    }
  )
})
