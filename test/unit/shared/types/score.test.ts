import { describe, expect, test } from 'vitest'

import {
  ClearLamp,
  FlareRank,
  getDanceLevel,
  mergeScoreRecords,
  type ScoreRecord,
  scoreRecordSchema,
} from '~~/shared/types/score'
import { notValidObject } from '~~/test/data/schema'

describe('/shared/types/score', () => {
  describe('scoreRecordSchema', () => {
    const validScoreRecord: ScoreRecord = {
      normalScore: 900000,
      clearLamp: ClearLamp.FC,
      rank: 'AA',
      flareRank: FlareRank.None,
    }
    test.each([
      ...notValidObject,
      { ...validScoreRecord, normalScore: -1 },
      { ...validScoreRecord, normalScore: 1000001 },
      { ...validScoreRecord, exScore: -5 },
      { ...validScoreRecord, maxCombo: -10 },
      { ...validScoreRecord, clearLamp: 8 },
      { ...validScoreRecord, rank: 'SSS' },
      { ...validScoreRecord, flareRank: 11 },
    ])('safeParse(%o) returns { success: false }', o =>
      expect(scoreRecordSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validScoreRecord,
      { ...validScoreRecord, exScore: null, maxCombo: null, flareSkill: null },
      { ...validScoreRecord, exScore: 0, maxCombo: 0 },
      { ...validScoreRecord, exScore: 1000 },
      { ...validScoreRecord, maxCombo: 300 },
      { ...validScoreRecord, flareRank: FlareRank.EX, flareSkill: 296 },
    ])('safeParse(%o) returns { success: true }', o =>
      expect(scoreRecordSchema.safeParse(o).success).toBe(true)
    )
  })

  describe('getDanceLevel', () => {
    test.each([
      [0, 'D'],
      [550000, 'D+'],
      [590000, 'C-'],
      [600000, 'C'],
      [650000, 'C+'],
      [690000, 'B-'],
      [700000, 'B'],
      [750000, 'B+'],
      [790000, 'A-'],
      [800000, 'A'],
      [850000, 'A+'],
      [890000, 'AA-'],
      [900000, 'AA'],
      [950000, 'AA+'],
      [990000, 'AAA'],
      [1000000, 'AAA'],
    ])('(%i) returns %s', (num, expected) =>
      expect(getDanceLevel(num)).toBe(expected)
    )
    test.each([-1, 10.5, NaN, Infinity, -Infinity, 1000010])(
      '(%d) throws error',
      d => expect(() => getDanceLevel(d)).toThrow()
    )
  })

  describe('mergeScoreRecords', () => {
    test.each([
      [
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Assisted,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Assisted,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Assisted,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
      ],
      [
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Life4,
          rank: 'AA',
          flareRank: FlareRank.I,
        },
        {
          normalScore: 850000,
          clearLamp: ClearLamp.FC,
          exScore: 100,
          rank: 'A+',
          flareRank: FlareRank.V,
        },
        {
          normalScore: 900000,
          clearLamp: ClearLamp.FC,
          rank: 'AA',
          exScore: 100,
          flareRank: FlareRank.V,
        },
      ],
      [
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Life4,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
        {
          normalScore: 920000,
          clearLamp: ClearLamp.Failed,
          rank: 'E',
          flareRank: FlareRank.None,
        },
        {
          normalScore: 920000,
          clearLamp: ClearLamp.Life4,
          rank: 'E',
          flareRank: FlareRank.None,
        },
      ],
      [
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Life4,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
        {
          normalScore: 850000,
          clearLamp: ClearLamp.FC,
          maxCombo: 100,
          rank: 'A+',
          flareRank: FlareRank.V,
          flareSkill: 299,
        },
        {
          normalScore: 900000,
          clearLamp: ClearLamp.FC,
          rank: 'AA',
          maxCombo: 100,
          flareRank: FlareRank.V,
          flareSkill: 299,
        },
      ],
      [
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Assisted,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Clear,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
        {
          normalScore: 900000,
          clearLamp: ClearLamp.Assisted,
          rank: 'AA',
          flareRank: FlareRank.None,
        },
      ],
    ] satisfies [ScoreRecord, ScoreRecord, ScoreRecord][])(
      '(%o, %o) returns %o',
      (left, right, expected) => {
        expect(mergeScoreRecords(left, right)).toStrictEqual(expected)
        expect(mergeScoreRecords(right, left)).toStrictEqual(expected)
      }
    )
  })
})
