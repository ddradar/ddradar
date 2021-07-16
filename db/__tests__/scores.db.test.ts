import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testScores,
} from '@ddradar/core/__tests__/data'

import { canConnectDB, getContainer } from '../database'
import {
  fetchScore,
  fetchScoreList,
  fetchSummaryClearLampCount,
  fetchSummaryRankCount,
} from '../scores'
import { describeIf } from './util'

describeIf(canConnectDB)('scores.ts', () => {
  const scores = testScores.flatMap(s => [
    {
      ...s,
      id: `${s.userId}-${s.songId}-${s.playStyle}-${s.difficulty}`,
    },
    {
      ...s,
      id: `${s.userId}-${s.songId}-${s.playStyle}-${s.difficulty}-deleted`,
      ttl: 3600,
    },
  ])
  beforeAll(
    async () =>
      await Promise.all(scores.map(u => getContainer('Users').items.create(u)))
  )
  afterAll(
    async () =>
      await Promise.all(
        scores.map(u => getContainer('Users').item(u.id, u.userId).delete())
      )
  )

  describe('fetchScore', () => {
    test.each(
      testScores.map(
        s =>
          [
            s.userId,
            s.songId,
            s.playStyle,
            s.difficulty,
            {
              ...s,
              id: `${s.userId}-${s.songId}-${s.playStyle}-${s.difficulty}`,
            },
          ] as const
      )
    )(
      '(%s, %s, %i, %i) returns %p',
      async (userId, songId, playStyle, difficulty, expected) =>
        await expect(
          fetchScore(userId, songId, playStyle, difficulty)
        ).resolves.toStrictEqual(expected)
    )
  })

  describe('fetchScoreList', () => {
    test.each(testScores.map(s => [s.userId, s] as const))(
      '(%s) returns [%p]',
      async (userId, expected) =>
        await expect(fetchScoreList(userId)).resolves.toStrictEqual([expected])
    )
  })

  test('fetchSummaryClearLampCount() returns expected', async () => {
    const template = {
      type: 'clear',
      playStyle: 1,
      level: 4,
      clearLamp: 5,
      count: 1,
    }
    await expect(fetchSummaryClearLampCount()).resolves.toStrictEqual([
      { userId: areaHiddenUser.id, ...template },
      { userId: privateUser.id, ...template },
      { userId: publicUser.id, ...template },
    ])
  })

  test('fetchSummaryRankCount() returns expected', async () => {
    const template = {
      type: 'score',
      playStyle: 1,
      level: 4,
      rank: 'AA+',
      count: 1,
    }
    await expect(fetchSummaryRankCount()).resolves.toStrictEqual([
      { userId: areaHiddenUser.id, ...template },
      { userId: privateUser.id, ...template },
      { userId: publicUser.id, ...template },
    ])
  })
})
