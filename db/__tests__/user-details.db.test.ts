import { Database, Score } from '@ddradar/core'
import { publicUser, testScores } from '@ddradar/core/__tests__/data'

import { canConnectDB, getContainer } from '../database'
import { fetchClearAndScoreStatus, generateGrooveRadar } from '../user-details'
import { describeIf } from './util'

describeIf(canConnectDB)('user-details.ts', () => {
  describe('generateGrooveRadar()', () => {
    const radar = { stream: 28, voltage: 22, air: 5, freeze: 0, chaos: 0 }
    const scores: (Database.ScoreSchema & { id: string })[] = [
      ...testScores.map(d => ({
        ...d,
        id: `${d.userId}-${d.songId}-${d.playStyle}-${d.difficulty}`,
        ...(Database.isAreaUser({ id: d.userId }) ? {} : { radar }),
      })),
      ...testScores.map(d => ({
        ...d,
        difficulty: 1 as const,
        id: `${d.userId}-${d.songId}-${d.playStyle}-1-deleted`,
        ...(Database.isAreaUser({ id: d.userId })
          ? {}
          : { radar: { ...radar, chaos: 100 } }),
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

  describe('fetchClearAndScoreStatus()', () => {
    const clears: (Database.ClearStatusSchema & { id: string })[] = [
      ...Array(19 * Score.clearLampMap.size).keys(),
    ].map(n => ({
      id: `clear-${publicUser.id}-${(n % 2) + 1}-${(n % 19) + 1}-${
        n % Score.clearLampMap.size
      }`,
      userId: publicUser.id,
      type: 'clear',
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      clearLamp: (n % Score.clearLampMap.size) as Score.ClearLamp,
      count: n,
    }))
    const ranks: (Database.ScoreStatusSchema & { id: string })[] = [
      ...Array(19 * Score.danceLevelSet.size).keys(),
    ].map(n => ({
      id: `score-${publicUser.id}-${(n % 2) + 1}-${(n % 19) + 1}-${
        n % Score.danceLevelSet.size
      }`,
      userId: publicUser.id,
      type: 'score',
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      rank: [...Score.danceLevelSet][n % Score.danceLevelSet.size],
      count: n,
    }))

    beforeAll(async () => {
      await Promise.all(
        clears.map(s => getContainer('UserDetails').items.create(s))
      )
      await Promise.all(
        ranks.map(s => getContainer('UserDetails').items.create(s))
      )
    })
    afterAll(async () => {
      await Promise.all(
        clears.map(s =>
          getContainer('UserDetails').item(s.id, s.userId).delete()
        )
      )
      await Promise.all(
        ranks.map(s =>
          getContainer('UserDetails').item(s.id, s.userId).delete()
        )
      )
    })

    test('(publicUser.id) returns clears + ranks', () =>
      expect(fetchClearAndScoreStatus(publicUser.id)).resolves.toHaveLength(
        clears.length + ranks.length
      ))
  })
})
