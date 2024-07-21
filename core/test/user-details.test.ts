import { describe, expect, test } from 'vitest'

import type { UserClearLampSchema, UserRankSchema } from '../src/user-details'
import { userClearLampSchema, userRankSchema } from '../src/user-details'

describe('user-details.ts', () => {
  describe('userClearLampSchema', () => {
    const validBody: UserClearLampSchema = {
      type: 'clear',
      userId: 'user_1',
      playStyle: 1,
      level: 5,
      clearLamp: 6,
      count: 53,
    }

    test.each([
      undefined,
      null,
      true,
      1,
      'foo',
      {},
      { ...validBody, count: 0.5 },
      { ...validBody, count: -1 },
    ])('safeParse(%o) returns { success: false }', o =>
      expect(userClearLampSchema.safeParse(o).success).toBe(false)
    )

    test.each([validBody, { ...validBody, count: 0 }])(
      'safeParse(%o) returns { success: true }',
      o => expect(userClearLampSchema.safeParse(o).success).toBe(true)
    )
  })
  describe('userRankSchema', () => {
    const validBody: UserRankSchema = {
      type: 'score',
      userId: 'user_1',
      playStyle: 1,
      level: 5,
      rank: 'AAA',
      count: 53,
    }

    test.each([
      undefined,
      null,
      true,
      1,
      'foo',
      {},
      { ...validBody, count: 0.5 },
      { ...validBody, count: -1 },
    ])('safeParse(%o) returns { success: false }', o =>
      expect(userRankSchema.safeParse(o).success).toBe(false)
    )

    test.each([validBody, { ...validBody, count: 0 }])(
      'safeParse(%o) returns { success: true }',
      o => expect(userRankSchema.safeParse(o).success).toBe(true)
    )
  })
})
