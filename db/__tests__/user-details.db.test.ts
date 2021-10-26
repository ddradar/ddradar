import { Database, Score } from '@ddradar/core'
import { publicUser } from '@ddradar/core/__tests__/data'

import { canConnectDB, getContainer } from '../database'
import { fetchClearAndScoreStatus } from '../user-details'
import { describeIf } from './util'

describeIf(canConnectDB)('user-details.ts', () => {
  describe('fetchClearAndScoreStatus()', () => {
    const clears: (Database.ClearStatusSchema & { id: string })[] = [
      ...Array(Score.clearLampMap.size).keys(),
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
      ...Array(Score.danceLevelSet.size).keys(),
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
      const container = getContainer('UserDetails')
      await Promise.all(clears.map(s => container.items.create(s)))
      await Promise.all(ranks.map(s => container.items.create(s)))
    })
    afterAll(async () => {
      const container = getContainer('UserDetails')
      await Promise.all(
        clears.map(s => container.item(s.id, s.userId).delete())
      )
      await Promise.all(ranks.map(s => container.item(s.id, s.userId).delete()))
    })

    test('(publicUser.id) returns clears + ranks', () =>
      expect(fetchClearAndScoreStatus(publicUser.id)).resolves.toHaveLength(
        clears.length + ranks.length
      ))
  })
})
