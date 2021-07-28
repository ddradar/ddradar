import { Database } from '@ddradar/core'
import { testScores } from '@ddradar/core/__tests__/data'

import { canConnectDB, getContainer } from '../database'
import { fetchScore } from '../scores'
import { describeIf } from './util'

describeIf(canConnectDB)('scores.ts', () => {
  const radar = { stream: 28, voltage: 22, air: 5, freeze: 0, chaos: 0 }
  const scores: (Database.ScoreSchema & { id: string })[] = [
    ...testScores.map(d => ({
      ...d,
      id: `${d.userId}-${d.songId}-${d.playStyle}-${d.difficulty}`,
      ...(Database.isAreaUser({ id: d.userId }) ? {} : { radar }),
    })),
    ...testScores.map(d => ({
      ...d,
      id: `${d.userId}-${d.songId}-${d.playStyle}-${d.difficulty}-deleted`,
      ...(Database.isAreaUser({ id: d.userId }) ? {} : { radar }),
      ttl: 3600,
    })),
    ...testScores.map(d => ({
      ...d,
      difficulty: 1 as const,
      id: `${d.userId}-${d.songId}-${d.playStyle}-1-deleted`,
      ...(Database.isAreaUser({ id: d.userId }) ? {} : { radar }),
      ttl: 3600,
    })),
  ]

  beforeAll(async () => {
    await Promise.all(scores.map(s => getContainer('Scores').items.create(s)))
  })
  afterAll(async () => {
    await Promise.all(
      scores.map(s => getContainer('Scores').item(s.id, s.userId).delete())
    )
  })

  describe('fetchScore', () => {
    test.each([
      ['foo', scores[0].songId, scores[0].playStyle, scores[0].difficulty],
      [scores[0].userId, 'foo', scores[0].playStyle, scores[0].difficulty],
      [scores[0].userId, scores[0].songId, 2 as const, scores[0].difficulty],
      [scores[0].userId, scores[0].songId, scores[0].playStyle, 3 as const],
      [scores[0].userId, scores[0].songId, scores[0].playStyle, 1 as const],
    ])(
      '("%s", "%s", %i, %i) returns null',
      async (userId, songId, playStyle, difficulty) => {
        expect(
          fetchScore(userId, songId, playStyle, difficulty)
        ).resolves.toBeNull()
      }
    )
    test.each(
      scores
        .slice(0, 4)
        .map(s => [s.userId, s.songId, s.playStyle, s.difficulty, s] as const)
    )(
      '("%s", "%s", %i, %i) returns %p',
      async (userId, songId, playStyle, difficulty, expected) => {
        expect(
          fetchScore(userId, songId, playStyle, difficulty)
        ).resolves.toStrictEqual(expected)
      }
    )
  })
})
