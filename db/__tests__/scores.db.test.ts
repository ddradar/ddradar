import { Database } from '@ddradar/core'
import {
  publicUser,
  testScores,
  testSongData,
} from '@ddradar/core/__tests__/data'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { canConnectDB, getContainer } from '../database'
import { fetchScore, fetchScoreList, generateGrooveRadar } from '../scores'
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
  const userId = publicUser.id
  const songId = testSongData.id

  beforeAll(async () => {
    await getContainer('Scores').items.batch(
      scores.map(s => ({ operationType: 'Upsert', resourceBody: s }))
    )
  }, 40000)
  afterAll(async () => {
    await Promise.all(
      scores.map(s => getContainer('Scores').item(s.id, s.userId).delete())
    )
  }, 40000)

  describe('fetchScore', () => {
    test.each([
      ['not_existed_user', songId, 1, 0],
      [userId, 'not_existed_song', 1, 0],
      [userId, songId, 2, 0],
      [userId, songId, 1, 3],
      [userId, songId, 1, 1],
    ] as const)(
      '("%s", "%s", %i, %i) returns null',
      (userId, songId, playStyle, difficulty) =>
        expect(
          fetchScore(userId, songId, playStyle, difficulty)
        ).resolves.toBeNull()
    )
    test.each(
      scores
        .slice(0, 4)
        .map(s => [s.userId, s.songId, s.playStyle, s.difficulty, s] as const)
    )(
      '("%s", "%s", %i, %i) returns %p',
      (userId, songId, playStyle, difficulty, expected) =>
        expect(
          fetchScore(userId, songId, playStyle, difficulty)
        ).resolves.toStrictEqual(expected)
    )
  })
  describe('fetchScoreList', () => {
    test.each([
      ['not_existed_user', {}],
      [userId, { playStyle: 2 }],
      [userId, { playStyle: 1, difficulty: 3 }],
      [userId, { level: 3 }],
      [userId, { clearLamp: 7 }],
      [userId, { rank: 'AAA' }],
    ] as const)('("%s", %p) returns []', (userId, conditions) =>
      expect(fetchScoreList(userId, conditions)).resolves.toHaveLength(0)
    )
    test.each([
      [userId, {}],
      [userId, { playStyle: 1 }],
      [userId, { difficulty: 0 }],
      [userId, { level: 4 }],
      [userId, { clearLamp: 5 }],
      [userId, { rank: 'AA+' }],
    ] as const)('("%s", %p) returns [expected]', (userId, conditions) =>
      expect(fetchScoreList(userId, conditions)).resolves.toStrictEqual([
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
          radar,
        },
      ])
    )
  })
  describe('generateGrooveRadar', () => {
    const emptyRadar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }
    test.each([
      ['not_exist_user', 1, emptyRadar],
      ['13', 1, emptyRadar],
      [publicUser.id, 1, radar],
    ] as const)('("%s", %i) returns %p', (userId, playStyle, expected) =>
      expect(generateGrooveRadar(userId, playStyle)).resolves.toStrictEqual({
        id: `radar-${userId}-${playStyle}`,
        userId,
        type: 'radar',
        playStyle,
        ...expected,
      })
    )
  })
})
