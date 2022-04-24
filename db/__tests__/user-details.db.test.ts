import { Score } from '@ddradar/core'
import { publicUser } from '@ddradar/core/__tests__/data'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { canConnectDB, getContainer } from '../database'
import { fetchClearAndScoreStatus } from '../user-details'
import { describeIf } from './util'

describeIf(canConnectDB)('user-details.ts', () => {
  describe('fetchClearAndScoreStatus()', () => {
    const clears = [...Array(Score.clearLampMap.size).keys()].map(
      n =>
        ({
          id: `clear-${publicUser.id}-${(n % 2) + 1}-${(n % 19) + 1}-${
            n % Score.clearLampMap.size
          }`,
          userId: publicUser.id,
          type: 'clear',
          playStyle: ((n % 2) + 1) as 1 | 2,
          level: (n % 19) + 1,
          clearLamp: (n % Score.clearLampMap.size) as Score.ClearLamp,
          count: n,
        } as const)
    )
    const ranks = [...Array(Score.danceLevelSet.size).keys()].map(
      n =>
        ({
          id: `score-${publicUser.id}-${(n % 2) + 1}-${(n % 19) + 1}-${
            n % Score.danceLevelSet.size
          }`,
          userId: publicUser.id,
          type: 'score',
          playStyle: ((n % 2) + 1) as 1 | 2,
          level: (n % 19) + 1,
          rank: [...Score.danceLevelSet][n % Score.danceLevelSet.size],
          count: n,
        } as const)
    )

    beforeAll(async () => {
      await getContainer('UserDetails').items.batch([
        ...clears.map(
          s => ({ operationType: 'Upsert', resourceBody: s } as const)
        ),
        ...ranks.map(
          s => ({ operationType: 'Upsert', resourceBody: s } as const)
        ),
      ])
    }, 40000)
    afterAll(async () => {
      await getContainer('UserDetails').items.batch([
        ...clears.map(
          ({ id, userId }) =>
            ({ operationType: 'Delete', id, partitionKey: userId } as const)
        ),
        ...ranks.map(
          ({ id, userId }) =>
            ({ operationType: 'Delete', id, partitionKey: userId } as const)
        ),
      ])
    }, 40000)

    test('(publicUser.id) returns clears + ranks', () =>
      expect(fetchClearAndScoreStatus(publicUser.id)).resolves.toHaveLength(
        clears.length + ranks.length
      ))
  })
})
