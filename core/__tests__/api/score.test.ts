import { describe, expect, test } from 'vitest'

import type { ScoreBody } from '../../src/api/score'
import { isScoreListBody } from '../../src/api/score'

describe('/api/score.ts', () => {
  describe('isScoreListBody', () => {
    const score: ScoreBody = {
      score: 1000000,
      clearLamp: 7,
      rank: 'AAA',
    }
    test.each([
      undefined,
      [],
      [{ score: 50000000 }],
      [{ ...score }],
      [{ ...score, playStyle: 'SINGLE', difficulty: 'BEGINNER' }],
      [{ ...score, playStyle: 1, difficulty: 5 }],
      [{ ...score, playStyle: 3, difficulty: 0 }],
      [{ ...score, playStyle: 1, difficulty: 4, topScore: 'foo' }],
    ])('(%o) returns false', body => expect(isScoreListBody(body)).toBe(false))
    test.each([
      [{ ...score, playStyle: 2, difficulty: 1 }],
      [{ ...score, maxCombo: 138, exScore: 414, playStyle: 1, difficulty: 3 }],
      [{ ...score, playStyle: 1, difficulty: 4, topScore: 1000000 }],
    ])('(%o) returns true', body => expect(isScoreListBody(body)).toBe(true))
  })
})
