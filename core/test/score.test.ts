import { describe, expect, test } from 'vitest'

import type { ScoreRecord } from '../src/score'
import {
  calcFlareSkill,
  detectJudgeCounts,
  getDanceLevel,
  isValidScore,
  mergeScore,
  setValidScoreFromChart,
} from '../src/score'
import { testSongData } from './data'

describe('score.ts', () => {
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
      d => expect(() => getDanceLevel(d)).toThrowError()
    )
  })

  describe('mergeScore', () => {
    test.each([
      [
        { score: 900000, clearLamp: 1, rank: 'AA' } as const,
        { score: 900000, clearLamp: 1, rank: 'AA' } as const,
        { score: 900000, clearLamp: 1, rank: 'AA' } as const,
      ],
      [
        { score: 900000, clearLamp: 3, rank: 'AA' } as const,
        { score: 850000, clearLamp: 4, exScore: 100, rank: 'A+' } as const,
        { score: 900000, clearLamp: 4, rank: 'AA', exScore: 100 } as const,
      ],
      [
        { score: 900000, clearLamp: 3, rank: 'AA' } as const,
        { score: 920000, clearLamp: 0, rank: 'E' } as const,
        { score: 920000, clearLamp: 3, rank: 'E' } as const,
      ],
      [
        { score: 900000, clearLamp: 3, rank: 'AA' } as const,
        { score: 850000, clearLamp: 4, maxCombo: 100, rank: 'A+' } as const,
        { score: 900000, clearLamp: 4, rank: 'AA', maxCombo: 100 } as const,
      ],
      [
        { score: 900000, clearLamp: 1, rank: 'AA' } as const,
        { score: 900000, clearLamp: 2, rank: 'AA' } as const,
        { score: 900000, clearLamp: 1, rank: 'AA' } as const,
      ],
    ])('(%o, %o) returns %o', (left, right, expected) => {
      expect(mergeScore(left, right)).toStrictEqual(expected)
      expect(mergeScore(right, left)).toStrictEqual(expected)
    })
  })

  describe('isValidScore', () => {
    const chart = {
      notes: 100,
      freezeArrow: 20,
      shockArrow: 10,
    } as const
    const baseScore: ScoreRecord = {
      score: 900000,
      clearLamp: 4,
      rank: 'AA',
    }
    test.each([
      { ...baseScore, exScore: 1000 },
      { ...baseScore, maxCombo: 1000 },
      { ...baseScore, exScore: 390 },
      { ...baseScore, exScore: 389 },
      { ...baseScore, exScore: 388 },
    ])('(chart, %o) returns false', score =>
      expect(isValidScore(chart, score)).toBe(false)
    )
    test.each([
      baseScore,
      { ...baseScore, exScore: 200 },
      { ...baseScore, clearLamp: 7, exScore: 390 },
      { ...baseScore, clearLamp: 6, exScore: 389 },
      { ...baseScore, clearLamp: 5, exScore: 388 },
      { ...baseScore, maxCombo: 110 },
      { ...baseScore, clearLamp: 3, maxCombo: 110 },
    ] as const)('(chart, %o) returns true', score =>
      expect(isValidScore(chart, score)).toBe(true)
    )
  })

  describe('setValidScoreFromChart', () => {
    const chart = { notes: 1000, freezeArrow: 10, shockArrow: 10 } as const

    const mfcScore: ScoreRecord = {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore: 3060,
      maxCombo: 1010,
    }
    /** Perfect:1 Score */
    const pfcScore: ScoreRecord = {
      ...mfcScore,
      score: 999990,
      clearLamp: 6,
      exScore: 3059,
    }
    /** Great:1 Score */
    const gfcScore: ScoreRecord = {
      ...pfcScore,
      score: 999590,
      clearLamp: 5,
      exScore: 3058,
    }
    /** Good:1 Score */
    const fcScore: ScoreRecord = {
      ...gfcScore,
      score: 999200,
      clearLamp: 4,
      exScore: 3057,
    }
    /** 0 point falied Score */
    const noPlayScore: ScoreRecord = {
      score: 0,
      rank: 'E',
      clearLamp: 0,
      exScore: 0,
      maxCombo: 0,
    }
    test.each([
      [{ clearLamp: 7 }, mfcScore], // MFC
      [{ score: 1000000 }, mfcScore], // MFC
      [{ exScore: 3060 }, mfcScore], // MFC
      [{ score: 999990 }, pfcScore], // P1
      [{ exScore: 3059 }, pfcScore], // P1
      [{ score: 999600 }, { ...pfcScore, score: 999600, exScore: 3020 }], // Maybe PFC (score is greater than Great:1 score)
      [
        { exScore: 3040, clearLamp: 6 },
        { ...pfcScore, score: 999800, exScore: 3040 },
      ], // P20
      [{ exScore: 3058, clearLamp: 5 }, gfcScore], // Gr1
      [{ score: 999590, clearLamp: 5 }, gfcScore], // Gr1
      [
        { score: 999500, clearLamp: 5 },
        { ...gfcScore, score: 999500, exScore: 3049 },
      ], // Gr1 P9
      [{ score: 999210 }, { ...gfcScore, score: 999210, exScore: 3020 }], // Maybe Great:1 FC (score is greater than Good:1 score)
      [
        { score: 987600, clearLamp: 5 },
        { score: 987600, rank: 'AA+', clearLamp: 5, maxCombo: 1010 },
      ], // Cannot guess EX SCORE
      [{ exScore: 3057, clearLamp: 4 }, fcScore], // Gd1
      [{ score: 999200, clearLamp: 4 }, fcScore], // Gd1
      [
        { score: 999000, clearLamp: 4 },
        { ...fcScore, score: 999000, exScore: 3037 },
      ], // Gd1 P20
      [
        { score: 999100 },
        { score: 999100, rank: 'AAA', clearLamp: 4, maxCombo: 1010 },
      ], // Maybe Full Combo (score is greater than Miss:1 score)
      [
        { score: 987600, clearLamp: 4 },
        { score: 987600, clearLamp: 4, rank: 'AA+', maxCombo: 1010 },
      ], // Cannot guess EX SCORE
      [
        { exScore: 3057, clearLamp: 2 },
        { score: 999010, rank: 'AAA', clearLamp: 2, exScore: 3057 },
      ], // Miss1
      [
        { exScore: 3057, rank: 'AAA' },
        { score: 999010, rank: 'AAA', clearLamp: 1, exScore: 3057 },
      ], // Miss1
      [
        { exScore: 3057, clearLamp: 0 },
        { score: 999010, rank: 'E', clearLamp: 0, exScore: 3057 },
      ], // Miss1 (Failed)
      [
        { exScore: 3057, rank: 'E' },
        { score: 999010, rank: 'E', clearLamp: 0, exScore: 3057 },
      ], // Miss1 (Failed)
      [
        { score: 999000, clearLamp: 2 },
        { score: 999000, rank: 'AAA', clearLamp: 2, exScore: 3056 },
      ], // Miss1 P1
      [
        { score: 999000, clearLamp: 0, maxCombo: 1010 },
        {
          score: 999000,
          rank: 'E',
          clearLamp: 0,
          exScore: 3056,
          maxCombo: 1010,
        },
      ], // Miss1 P1 (missed last FA)
      [
        { score: 948260, clearLamp: 3, maxCombo: 260 },
        { score: 948260, rank: 'AA', clearLamp: 3, maxCombo: 260 },
      ],
      [
        { score: 948260, maxCombo: 260 },
        { score: 948260, rank: 'AA', clearLamp: 2, maxCombo: 260 },
      ],
      [
        { score: 8460, rank: 'E' },
        { score: 8460, rank: 'E', clearLamp: 0 },
      ],
      [{ score: 0, clearLamp: 0 }, noPlayScore], // 0 point falied
      [{ score: 0, rank: 'E' }, noPlayScore], // 0 point falied
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, clearLamp: 1 } as Partial<ScoreRecord>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as ScoreRecord,
      ],
      [
        { score: 0, clearLamp: 2 },
        { ...noPlayScore, rank: 'D', clearLamp: 1 },
      ], // 0 point clear (Maybe use Assist option)
      [
        { score: 0, rank: 'D' },
        { ...noPlayScore, rank: 'D', clearLamp: 1 },
      ], // 0 point clear (Maybe use Assist option)
      [
        { score: 0, clearLamp: 2, flareRank: 1 },
        { ...noPlayScore, rank: 'D', clearLamp: 2, flareRank: 1 },
      ], // 0 point clear (FLARE I Clear)
    ] as const)(
      '({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, %o) returns %o',
      (score: Partial<ScoreRecord>, expected: ScoreRecord) =>
        expect(setValidScoreFromChart(chart, score)).toStrictEqual(expected)
    )
    test('({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, { exScore: 800 }) throws error', () =>
      expect(() =>
        setValidScoreFromChart(chart, { exScore: 800 })
      ).toThrowError(/^Cannot guess Score object. set score property/))
    test.each([
      [
        { score: 993100, clearLamp: 5 },
        {
          score: 993100,
          rank: 'AAA',
          clearLamp: 5,
          exScore: 509,
          maxCombo: 180,
        },
      ], // Gr3 P55
      [
        { score: 989100, clearLamp: 5 },
        {
          score: 989100,
          rank: 'AA+',
          clearLamp: 5,
          exScore: 528,
          maxCombo: 180,
        },
      ], // Gr5 P32
    ] as const)(
      '({ notes: 180, freezeArrow: 10, shockArrow: 0 }, %o) returns %o',
      (incompleteScore: Partial<ScoreRecord>, expected: ScoreRecord) => {
        // Arrange
        const chart = { notes: 180, freezeArrow: 10, shockArrow: 0 }

        // Act
        const actual = setValidScoreFromChart(chart, incompleteScore)

        // Assert
        expect(actual).toStrictEqual(expected)
      }
    )
  })

  describe('calcFlareSkill', () => {
    test.each([0, -1, 1.1, 21, NaN, Infinity, -Infinity])(
      `(%d, 0) throws error`,
      d => expect(() => calcFlareSkill(d, 0)).toThrowError()
    )

    test.each([
      [1, 0, 145],
      [2, 0, 155],
      [3, 0, 170],
      [4, 0, 185],
      [5, 0, 205],
      [6, 0, 230],
      [7, 0, 255],
      [8, 0, 290],
      [9, 0, 335],
      [10, 0, 400],
      [11, 0, 465],
      [12, 0, 510],
      [13, 0, 545],
      [14, 0, 575],
      [15, 0, 600],
      [16, 0, 620],
      [17, 0, 635],
      [18, 0, 650],
      [19, 0, 665],
      [1, 10, 232],
      [2, 10, 248],
      [3, 10, 272],
      [4, 10, 296],
      [5, 10, 328],
      [6, 10, 368],
      [7, 10, 408],
      [8, 10, 464],
      [9, 10, 536],
      [10, 10, 640],
      [11, 10, 744],
      [12, 10, 816],
      [13, 10, 872],
      [14, 10, 920],
      [15, 10, 960],
      [16, 10, 992],
      [17, 10, 1016],
      [18, 10, 1040],
      [19, 10, 1064],
    ] as const)(`(%d, %d) returns %d`, (level, flareRank, expected) =>
      expect(calcFlareSkill(level, flareRank)).toBe(expected)
    )
  })

  describe('detectJudgeCounts', () => {
    const chart = {
      notes: testSongData.charts[0].notes,
      freezeArrow: testSongData.charts[0].freezeArrow,
      shockArrow: testSongData.charts[0].shockArrow,
    }
    test.each([
      [
        chart,
        1000000,
        7 as const,
        [{ marvelousOrOk: 138, perfect: 0, great: 0, good: 0, miss: 0 }],
      ],
      [
        chart,
        999000,
        6 as const,
        [{ marvelousOrOk: 38, perfect: 100, great: 0, good: 0, miss: 0 }],
      ],
      [testSongData.charts[0], 998000, undefined, []],
      [
        chart,
        950360,
        5 as const,
        [{ marvelousOrOk: 102, perfect: 19, great: 17, good: 0, miss: 0 }],
      ],
      [
        chart,
        969780,
        4 as const,
        [
          { marvelousOrOk: 15, perfect: 118, great: 0, good: 5, miss: 0 },
          { marvelousOrOk: 15, perfect: 117, great: 2, good: 4, miss: 0 },
          { marvelousOrOk: 15, perfect: 116, great: 4, good: 3, miss: 0 },
          { marvelousOrOk: 15, perfect: 115, great: 6, good: 2, miss: 0 },
          { marvelousOrOk: 15, perfect: 114, great: 8, good: 1, miss: 0 },
          { marvelousOrOk: 15, perfect: 113, great: 10, good: 0, miss: 0 },
        ],
      ],
      [
        chart,
        940360,
        3 as const,
        [
          { marvelousOrOk: 116, perfect: 12, great: 0, good: 9, miss: 1 },
          { marvelousOrOk: 116, perfect: 11, great: 2, good: 8, miss: 1 },
          { marvelousOrOk: 116, perfect: 10, great: 4, good: 7, miss: 1 },
          { marvelousOrOk: 116, perfect: 9, great: 6, good: 6, miss: 1 },
          { marvelousOrOk: 116, perfect: 8, great: 8, good: 5, miss: 1 },
          { marvelousOrOk: 116, perfect: 7, great: 10, good: 4, miss: 1 },
          { marvelousOrOk: 116, perfect: 6, great: 12, good: 3, miss: 1 },
          { marvelousOrOk: 116, perfect: 5, great: 14, good: 2, miss: 1 },
          { marvelousOrOk: 116, perfect: 4, great: 16, good: 1, miss: 1 },
          { marvelousOrOk: 116, perfect: 3, great: 18, good: 0, miss: 1 },
          { marvelousOrOk: 114, perfect: 14, great: 1, good: 6, miss: 3 },
          { marvelousOrOk: 114, perfect: 13, great: 3, good: 5, miss: 3 },
          { marvelousOrOk: 114, perfect: 12, great: 5, good: 4, miss: 3 },
          { marvelousOrOk: 114, perfect: 11, great: 7, good: 3, miss: 3 },
          { marvelousOrOk: 114, perfect: 10, great: 9, good: 2, miss: 3 },
          { marvelousOrOk: 114, perfect: 9, great: 11, good: 1, miss: 3 },
          { marvelousOrOk: 114, perfect: 8, great: 13, good: 0, miss: 3 },
        ],
      ],
      [
        { notes: 300, freezeArrow: 30, shockArrow: 10 },
        984500,
        undefined,
        [
          { marvelousOrOk: 320, perfect: 13, great: 1, good: 6, miss: 0 },
          { marvelousOrOk: 320, perfect: 12, great: 3, good: 5, miss: 0 },
          { marvelousOrOk: 320, perfect: 11, great: 5, good: 4, miss: 0 },
          { marvelousOrOk: 320, perfect: 10, great: 7, good: 3, miss: 0 },
          { marvelousOrOk: 320, perfect: 9, great: 9, good: 2, miss: 0 },
          { marvelousOrOk: 320, perfect: 8, great: 11, good: 1, miss: 0 },
          { marvelousOrOk: 320, perfect: 7, great: 13, good: 0, miss: 0 },
          { marvelousOrOk: 318, perfect: 16, great: 0, good: 4, miss: 2 },
          { marvelousOrOk: 318, perfect: 15, great: 2, good: 3, miss: 2 },
          { marvelousOrOk: 318, perfect: 14, great: 4, good: 2, miss: 2 },
          { marvelousOrOk: 318, perfect: 13, great: 6, good: 1, miss: 2 },
          { marvelousOrOk: 318, perfect: 12, great: 8, good: 0, miss: 2 },
          { marvelousOrOk: 316, perfect: 18, great: 1, good: 1, miss: 4 },
          { marvelousOrOk: 316, perfect: 17, great: 3, good: 0, miss: 4 },
          { marvelousOrOk: 260, perfect: 74, great: 0, good: 5, miss: 1 },
          { marvelousOrOk: 260, perfect: 73, great: 2, good: 4, miss: 1 },
          { marvelousOrOk: 260, perfect: 72, great: 4, good: 3, miss: 1 },
          { marvelousOrOk: 260, perfect: 71, great: 6, good: 2, miss: 1 },
          { marvelousOrOk: 260, perfect: 70, great: 8, good: 1, miss: 1 },
          { marvelousOrOk: 260, perfect: 69, great: 10, good: 0, miss: 1 },
          { marvelousOrOk: 258, perfect: 76, great: 1, good: 2, miss: 3 },
          { marvelousOrOk: 258, perfect: 75, great: 3, good: 1, miss: 3 },
          { marvelousOrOk: 258, perfect: 74, great: 5, good: 0, miss: 3 },
          { marvelousOrOk: 256, perfect: 79, great: 0, good: 0, miss: 5 },
          { marvelousOrOk: 202, perfect: 132, great: 0, good: 6, miss: 0 },
          { marvelousOrOk: 202, perfect: 131, great: 2, good: 5, miss: 0 },
          { marvelousOrOk: 202, perfect: 130, great: 4, good: 4, miss: 0 },
          { marvelousOrOk: 202, perfect: 129, great: 6, good: 3, miss: 0 },
          { marvelousOrOk: 202, perfect: 128, great: 8, good: 2, miss: 0 },
          { marvelousOrOk: 202, perfect: 127, great: 10, good: 1, miss: 0 },
          { marvelousOrOk: 202, perfect: 126, great: 12, good: 0, miss: 0 },
          { marvelousOrOk: 200, perfect: 134, great: 1, good: 3, miss: 2 },
          { marvelousOrOk: 200, perfect: 133, great: 3, good: 2, miss: 2 },
          { marvelousOrOk: 200, perfect: 132, great: 5, good: 1, miss: 2 },
          { marvelousOrOk: 200, perfect: 131, great: 7, good: 0, miss: 2 },
          { marvelousOrOk: 198, perfect: 137, great: 0, good: 1, miss: 4 },
          { marvelousOrOk: 198, perfect: 136, great: 2, good: 0, miss: 4 },
          { marvelousOrOk: 142, perfect: 192, great: 1, good: 4, miss: 1 },
          { marvelousOrOk: 142, perfect: 191, great: 3, good: 3, miss: 1 },
          { marvelousOrOk: 142, perfect: 190, great: 5, good: 2, miss: 1 },
          { marvelousOrOk: 142, perfect: 189, great: 7, good: 1, miss: 1 },
          { marvelousOrOk: 142, perfect: 188, great: 9, good: 0, miss: 1 },
          { marvelousOrOk: 140, perfect: 195, great: 0, good: 2, miss: 3 },
          { marvelousOrOk: 140, perfect: 194, great: 2, good: 1, miss: 3 },
          { marvelousOrOk: 140, perfect: 193, great: 4, good: 0, miss: 3 },
          { marvelousOrOk: 85, perfect: 249, great: 1, good: 5, miss: 0 },
          { marvelousOrOk: 85, perfect: 248, great: 3, good: 4, miss: 0 },
          { marvelousOrOk: 85, perfect: 247, great: 5, good: 3, miss: 0 },
          { marvelousOrOk: 85, perfect: 246, great: 7, good: 2, miss: 0 },
          { marvelousOrOk: 85, perfect: 245, great: 9, good: 1, miss: 0 },
          { marvelousOrOk: 85, perfect: 244, great: 11, good: 0, miss: 0 },
          { marvelousOrOk: 83, perfect: 252, great: 0, good: 3, miss: 2 },
          { marvelousOrOk: 83, perfect: 251, great: 2, good: 2, miss: 2 },
          { marvelousOrOk: 83, perfect: 250, great: 4, good: 1, miss: 2 },
          { marvelousOrOk: 83, perfect: 249, great: 6, good: 0, miss: 2 },
          { marvelousOrOk: 81, perfect: 254, great: 1, good: 0, miss: 4 },
          { marvelousOrOk: 25, perfect: 310, great: 0, good: 4, miss: 1 },
          { marvelousOrOk: 25, perfect: 309, great: 2, good: 3, miss: 1 },
          { marvelousOrOk: 25, perfect: 308, great: 4, good: 2, miss: 1 },
          { marvelousOrOk: 25, perfect: 307, great: 6, good: 1, miss: 1 },
          { marvelousOrOk: 25, perfect: 306, great: 8, good: 0, miss: 1 },
          { marvelousOrOk: 23, perfect: 312, great: 1, good: 1, miss: 3 },
          { marvelousOrOk: 23, perfect: 311, great: 3, good: 0, miss: 3 },
        ],
      ],
    ])('(%o, %i, %i) returns %o', (chart, score, clearLamp, expected) =>
      expect(detectJudgeCounts(chart, score, clearLamp)).toStrictEqual(expected)
    )
  })
})
