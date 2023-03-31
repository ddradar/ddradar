import type {
  ClearLamp,
  DanceLevel,
  UserClearLampSchema,
  UserRankSchema,
} from '@ddradar/db-definitions'
import { clearLampMap, danceLevelSet } from '@ddradar/db-definitions'
import { publicUser } from '@ddradar/db-definitions/test/data'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { canConnectDB, getContainer } from '../src/database'
import { fetchClearAndScoreStatus } from '../src/user-details'

describe.runIf(canConnectDB())('user-details.ts', () => {
  describe('fetchClearAndScoreStatus()', () => {
    const clears: (UserClearLampSchema & { id: string })[] = [
      ...Array(clearLampMap.size).keys(),
    ].map(n => ({
      id: `clear-${publicUser.id}-${(n % 2) + 1}-${(n % 19) + 1}-${
        n % clearLampMap.size
      }`,
      userId: publicUser.id,
      type: 'clear',
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      clearLamp: (n % clearLampMap.size) as ClearLamp,
      count: n,
    }))
    const ranks: (UserRankSchema & { id: string })[] = [
      ...Array(danceLevelSet.size).keys(),
    ].map(n => ({
      id: `score-${publicUser.id}-${(n % 2) + 1}-${(n % 19) + 1}-${
        n % danceLevelSet.size
      }`,
      userId: publicUser.id,
      type: 'score',
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      rank: [...danceLevelSet][n % danceLevelSet.size] as DanceLevel,
      count: n,
    }))
    const userDetails = [...clears, ...ranks]

    beforeAll(async () => {
      await getContainer('UserDetails').items.bulk(
        userDetails.map(s => ({ operationType: 'Create', resourceBody: s }))
      )
    }, 50000)
    afterAll(async () => {
      await getContainer('UserDetails').items.bulk(
        userDetails.map(s => ({
          operationType: 'Delete',
          id: s.id,
          partitionKey: s.userId,
        }))
      )
    }, 50000)

    test('(publicUser.id) returns clears + ranks', () =>
      expect(fetchClearAndScoreStatus(publicUser.id)).resolves.toHaveLength(
        userDetails.length
      ))
  })
})
