import { publicUser, testScores, testSongData } from '@ddradar/core/test/data'
import { describe, expect, test } from 'vitest'

import { type DBScoreSchema, dbScoreSchema } from '../../src/schemas/scores'

describe('/schemas/scores', () => {
  const validScore: DBScoreSchema = {
    id: `${testSongData.id}/${testScores[0].playStyle}/${testScores[0].difficulty}/${publicUser.id}`,
    type: 'score',
    user: {
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      isPublic: publicUser.isPublic,
    },
    song: {
      id: testSongData.id,
      name: testSongData.name,
      seriesCategory: testSongData.seriesCategory,
      deleted: testSongData.deleted,
    },
    chart: {
      playStyle: testScores[0].playStyle,
      difficulty: testScores[0].difficulty,
      level: testScores[0].level,
    },
    score: testScores[0].score,
    clearLamp: testScores[0].clearLamp,
    rank: testScores[0].rank,
    maxCombo: testScores[0].maxCombo,
    exScore: testScores[0].exScore,
  }

  describe('dbScoreSchema', () => {
    test.each([
      undefined,
      null,
      true,
      1,
      'foo',
      {},
      { ...validScore, id: 'foo' },
    ])('safeParse(%o) returns { success: false }', o => {
      expect(dbScoreSchema.safeParse(o).success).toBe(false)
    })
    test.each([validScore, { ...validScore, type: undefined }])(
      'safeParse(%o) returns { success: true }',
      o => {
        expect(dbScoreSchema.safeParse(o).success).toBe(true)
      }
    )
  })
})
