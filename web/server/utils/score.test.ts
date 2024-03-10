// @vitest-environment node
import type { OperationInput } from '@azure/cosmos'
import type { Score, ScoreSchema } from '@ddradar/core'
import { privateUser, testSongData } from '@ddradar/core/test/data'
import { describe, expect, test } from 'vitest'

import { topUser, upsertScore } from '~/server/utils/score'

describe('server/utils/score.ts', () => {
  describe('upsertScore', () => {
    const chartInfo = {
      ...testSongData,
      ...testSongData.charts[0],
    }
    const score = { score: 900000, clearLamp: 2, rank: 'AA' } as const
    const oldScore = {
      songId: testSongData.id,
      songName: testSongData.name,
      playStyle: testSongData.charts[0].playStyle,
      difficulty: testSongData.charts[0].difficulty,
      level: testSongData.charts[0].level,
      ...score,
    } as const
    test.each([
      [privateUser, [], score, 1, 1],
      [topUser, [], score, 0, 1],
      [
        privateUser,
        [
          {
            ...oldScore,
            userId: privateUser.id,
            userName: privateUser.name,
            isPublic: privateUser.isPublic,
          },
        ],
        score,
        0,
        0,
      ],
      [
        privateUser,
        [
          {
            ...oldScore,
            userId: privateUser.id,
            userName: privateUser.name,
            isPublic: privateUser.isPublic,
          },
        ],
        { ...score, score: 1000000 },
        1,
        2,
      ],
    ])(
      '(chartInfo, %o, %o, %o, result, operations) sets %i object on result & %i object sets on operations',
      (
        user,
        oldScores: ScoreSchema[],
        score: Score,
        resultCount,
        operationsCount
      ) => {
        const result: ScoreSchema[] = []
        const operations: OperationInput[] = []

        // Act
        upsertScore(chartInfo, user, oldScores, score, result, operations)

        // Assert
        expect(result).toHaveLength(resultCount)
        expect(operations).toHaveLength(operationsCount)
      }
    )
  })
})
