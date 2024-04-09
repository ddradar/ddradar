import type { ItemDefinition } from '@azure/cosmos'
import { InvocationContext } from '@azure/functions'
import type { UserClearLampSchema, UserRankSchema } from '@ddradar/core'
import { describe, expect, test } from 'vitest'

import { handler } from '../../src/functions/generateUserDetails'

describe('/functions/generateUserDetails.ts', () => {
  const status = {
    userId: 'foo',
    playStyle: 1,
    level: 5,
    count: 20,
  } as const
  const oldClear: UserClearLampSchema & ItemDefinition = {
    ...status,
    id: 'old_clear',
    type: 'clear',
    clearLamp: 6,
  }
  const oldScore: UserRankSchema & ItemDefinition = {
    ...status,
    id: 'old_score',
    type: 'score',
    rank: 'AAA',
  }
  const newClears: UserClearLampSchema[] = [
    {
      ...status,
      type: 'clear',
      clearLamp: 6,
      count: 30,
    },
    {
      ...status,
      type: 'clear',
      clearLamp: 5,
      count: 10,
    },
  ]
  const newScores: UserRankSchema[] = [
    {
      ...status,
      type: 'score',
      rank: 'AAA',
      count: 30,
    },
    {
      ...status,
      type: 'score',
      rank: 'AA+',
      count: 10,
    },
  ]

  test('merges old.id & new data', async () => {
    // Arrange
    const deletedClear: UserClearLampSchema & ItemDefinition = {
      ...oldClear,
      id: 'deleted_clear',
      type: 'clear',
      clearLamp: 4,
    }
    const deletedScore: UserRankSchema & ItemDefinition = {
      ...oldScore,
      id: 'deleted_score',
      rank: 'AA',
    }
    const ctx = new InvocationContext()
    ctx.extraInputs.set('oldSummeries', [
      oldScore,
      oldClear,
      deletedClear,
      deletedScore,
    ])
    ctx.extraInputs.set('newClearLampCounts', newClears)
    ctx.extraInputs.set('newRankCounts', newScores)

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toHaveLength(6)
    expect(result).toStrictEqual([
      { ...oldClear, count: 30 },
      { ...newClears[1], id: undefined },
      { ...oldScore, count: 30 },
      { ...newScores[1], id: undefined },
      { ...deletedClear, count: 0 },
      { ...deletedScore, count: 0 },
    ])
  })
})
