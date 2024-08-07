import type { ScoreSchema } from '@ddradar/core'
import { publicUser, testScores, testSongData } from '@ddradar/core/test/data'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { canConnectDB, getContainer } from '../src/database'
import { fetchScore, fetchScoreList } from '../src/scores'

describe.runIf(canConnectDB())('scores.ts', () => {
  const scores: (ScoreSchema & { id: string })[] = [
    ...testScores.map(d => ({
      ...d,
      id: `${d.userId}-${d.songId}-${d.playStyle}-${d.difficulty}`,
    })),
    ...testScores.map(d => ({
      ...d,
      id: `${d.userId}-${d.songId}-${d.playStyle}-${d.difficulty}-deleted`,
      ttl: 3600,
    })),
    ...testScores.map(d => ({
      ...d,
      difficulty: 1 as const,
      id: `${d.userId}-${d.songId}-${d.playStyle}-1-deleted`,
      ttl: 3600,
    })),
  ]
  const userId = publicUser.id
  const songId = testSongData.id

  beforeAll(async () => {
    await getContainer('Scores').items.bulk(
      scores.map(s => ({
        operationType: 'Create',
        resourceBody: s,
      }))
    )
  }, 50000)
  afterAll(async () => {
    await getContainer('Scores').items.bulk(
      scores.map(s => ({
        operationType: 'Delete',
        partitionKey: s.userId,
        id: s.id,
      }))
    )
  }, 50000)

  describe('fetchScore', () => {
    test.each([
      ['not_existed_user', songId, 1 as const, 0 as const],
      [userId, 'not_existed_song', 1 as const, 0 as const],
      [userId, songId, 2 as const, 0 as const],
      [userId, songId, 1 as const, 3 as const],
      [userId, songId, 1 as const, 1 as const],
    ])(
      '("%s", "%s", %i, %i) returns null',
      async (userId, songId, playStyle, difficulty) => {
        expect(
          await fetchScore(userId, songId, playStyle, difficulty)
        ).toBeNull()
      }
    )
    test.each(
      scores
        .slice(0, 4)
        .map(s => [s.userId, s.songId, s.playStyle, s.difficulty, s] as const)
    )(
      '("%s", "%s", %i, %i) returns %o',
      async (userId, songId, playStyle, difficulty, expected) =>
        expect(
          await fetchScore(userId, songId, playStyle, difficulty)
        ).toStrictEqual(expected)
    )
  })
  describe('fetchScoreList', () => {
    test.each([
      ['not_existed_user', {}],
      [userId, { playStyle: 2 as const }],
      [userId, { playStyle: 1 as const, difficulty: 3 as const }],
      [userId, { level: 3 }],
      [userId, { clearLamp: 7 as const }],
      [userId, { rank: 'AAA' as const }],
    ])('("%s", %o) returns []', async (userId, conditions) => {
      expect(await fetchScoreList(userId, conditions)).toHaveLength(0)
    })
    test.each([
      [userId, {}],
      [userId, { playStyle: 1 as const }],
      [userId, { difficulty: 0 as const }],
      [userId, { level: 4 }],
      [userId, { clearLamp: 5 as const }],
      [userId, { rank: 'AA+' as const }],
    ])('("%s", %o) returns [expected]', async (userId, conditions) => {
      expect(await fetchScoreList(userId, conditions)).toStrictEqual([
        {
          songId,
          songName: testSongData.name,
          playStyle: testSongData.charts[0].playStyle,
          difficulty: testSongData.charts[0].difficulty,
          level: testSongData.charts[0].level,
          score: testScores[2].score,
          exScore: testScores[2].exScore,
          maxCombo: testScores[2].maxCombo,
          clearLamp: testScores[2].clearLamp,
          rank: testScores[2].rank,
        },
      ])
    })
  })
})
