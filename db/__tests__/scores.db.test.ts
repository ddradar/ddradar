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
      '("%s", "%s", %i, %i) returns %p',
      async (userId, songId, playStyle, difficulty, expected) => {
        const score = await fetchScore(userId, songId, playStyle, difficulty)
        expect(score).toStrictEqual(expected)
      }
    )
  })

  describe('fetchScoreList', () => {
    test.each(testScores.map(s => [s.userId, s] as const))(
      '("%s") returns [%p]',
      async (userId, expected) => {
        const scores = await fetchScoreList(userId)
        expect(scores).toStrictEqual([expected])
      }
    )
  })

  test('fetchSummaryClearLampCount() returns expected', async () => {
    // Arrange
    const template = {
      type: 'clear',
      playStyle: 1,
      level: 4,
      clearLamp: 5,
      count: 1,
    }

    // Act
    const clearCounts = await fetchSummaryClearLampCount()

    // Assert
    expect(clearCounts).toStrictEqual([
      { userId: areaHiddenUser.id, ...template },
      { userId: privateUser.id, ...template },
      { userId: publicUser.id, ...template },
    ])
  })

  test('fetchSummaryRankCount() returns expected', async () => {
    // Arrange
    const template = {
      type: 'score',
      playStyle: 1,
      level: 4,
      rank: 'AA+',
      count: 1,
    }
    // Act
    const ranks = await fetchSummaryRankCount()

    // Assert
    expect(ranks).toStrictEqual([
      { userId: areaHiddenUser.id, ...template },
      { userId: privateUser.id, ...template },
      { userId: publicUser.id, ...template },
    ])
  })
})
