import { describe, expect, test } from 'vitest'

import type { ScoreRecord } from '../src/score'
import {
  calcFlareSkill,
  detectJudgeCounts,
  Flare,
  getDanceLevel,
  isValidScore,
  Lamp,
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
        { score: 900000, clearLamp: Lamp.Assisted, rank: 'AA' },
        { score: 900000, clearLamp: Lamp.Assisted, rank: 'AA' },
        { score: 900000, clearLamp: Lamp.Assisted, rank: 'AA' },
      ],
      [
        { score: 900000, clearLamp: Lamp.Life4, rank: 'AA' },
        { score: 850000, clearLamp: Lamp.FC, exScore: 100, rank: 'A+' },
        { score: 900000, clearLamp: Lamp.FC, rank: 'AA', exScore: 100 },
      ],
      [
        { score: 900000, clearLamp: Lamp.Life4, rank: 'AA' },
        { score: 920000, clearLamp: Lamp.Failed, rank: 'E' },
        { score: 920000, clearLamp: Lamp.Life4, rank: 'E' },
      ],
      [
        { score: 900000, clearLamp: Lamp.Life4, rank: 'AA' },
        { score: 850000, clearLamp: Lamp.FC, maxCombo: 100, rank: 'A+' },
        { score: 900000, clearLamp: Lamp.FC, rank: 'AA', maxCombo: 100 },
      ],
      [
        { score: 900000, clearLamp: Lamp.Assisted, rank: 'AA' },
        { score: 900000, clearLamp: Lamp.Clear, rank: 'AA' },
        { score: 900000, clearLamp: Lamp.Assisted, rank: 'AA' },
      ],
    ] satisfies [ScoreRecord, ScoreRecord, ScoreRecord][])(
      '(%o, %o) returns %o',
      (left, right, expected) => {
        expect(mergeScore(left, right)).toStrictEqual(expected)
        expect(mergeScore(right, left)).toStrictEqual(expected)
      }
    )
  })

  describe('isValidScore', () => {
    const chart = {
      notes: 100,
      freezeArrow: 20,
      shockArrow: 10,
    } as const
    const baseScore: ScoreRecord = {
      score: 900000,
      clearLamp: Lamp.FC,
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
      { ...baseScore, clearLamp: Lamp.MFC, exScore: 390 },
      { ...baseScore, clearLamp: Lamp.PFC, exScore: 389 },
      { ...baseScore, clearLamp: Lamp.GFC, exScore: 388 },
      { ...baseScore, maxCombo: 110 },
      { ...baseScore, clearLamp: Lamp.Life4, maxCombo: 110 },
    ] as const)('(chart, %o) returns true', score =>
      expect(isValidScore(chart, score)).toBe(true)
    )
  })

  describe('setValidScoreFromChart', () => {
    const chart = { notes: 1000, freezeArrow: 10, shockArrow: 10 } as const

    const mfcScore: ScoreRecord = {
      score: 1000000,
      rank: 'AAA',
      clearLamp: Lamp.MFC,
      exScore: 3060,
      maxCombo: 1010,
    }
    /** Perfect:1 Score */
    const pfcScore: ScoreRecord = {
      ...mfcScore,
      score: 999990,
      clearLamp: Lamp.PFC,
      exScore: 3059,
    }
    /** Great:1 Score */
    const gfcScore: ScoreRecord = {
      ...pfcScore,
      score: 999590,
      clearLamp: Lamp.GFC,
      exScore: 3058,
    }
    /** Good:1 Score */
    const fcScore: ScoreRecord = {
      ...gfcScore,
      score: 999200,
      clearLamp: Lamp.FC,
      exScore: 3057,
    }
    /** 0 point falied Score */
    const noPlayScore: ScoreRecord = {
      score: 0,
      rank: 'E',
      clearLamp: Lamp.Failed,
      exScore: 0,
      maxCombo: 0,
    }
    test.each([
      [{ clearLamp: Lamp.MFC }, mfcScore], // MFC
      [{ score: 1000000 }, mfcScore], // MFC
      [{ exScore: 3060 }, mfcScore], // MFC
      [{ score: 999990 }, pfcScore], // P1
      [{ exScore: 3059 }, pfcScore], // P1
      [{ score: 999600 }, { ...pfcScore, score: 999600, exScore: 3020 }], // Maybe PFC (score is greater than Great:1 score)
      [
        { exScore: 3040, clearLamp: Lamp.PFC },
        { ...pfcScore, score: 999800, exScore: 3040 },
      ], // P20
      [{ exScore: 3058, clearLamp: Lamp.GFC }, gfcScore], // Gr1
      [{ score: 999590, clearLamp: Lamp.GFC }, gfcScore], // Gr1
      [
        { score: 999500, clearLamp: Lamp.GFC },
        { ...gfcScore, score: 999500, exScore: 3049 },
      ], // Gr1 P9
      [{ score: 999210 }, { ...gfcScore, score: 999210, exScore: 3020 }], // Maybe Great:1 FC (score is greater than Good:1 score)
      [
        { score: 987600, clearLamp: Lamp.GFC },
        { score: 987600, rank: 'AA+', clearLamp: Lamp.GFC, maxCombo: 1010 },
      ], // Cannot guess EX SCORE
      [{ exScore: 3057, clearLamp: Lamp.FC }, fcScore], // Gd1
      [{ score: 999200, clearLamp: Lamp.FC }, fcScore], // Gd1
      [
        { score: 999000, clearLamp: Lamp.FC },
        { ...fcScore, score: 999000, exScore: 3037 },
      ], // Gd1 P20
      [
        { score: 999100 },
        { score: 999100, rank: 'AAA', clearLamp: Lamp.FC, maxCombo: 1010 },
      ], // Maybe Full Combo (score is greater than Miss:1 score)
      [
        { score: 987600, clearLamp: Lamp.FC },
        { score: 987600, clearLamp: Lamp.FC, rank: 'AA+', maxCombo: 1010 },
      ], // Cannot guess EX SCORE
      [
        { exScore: 3057, clearLamp: Lamp.Clear },
        { score: 999010, rank: 'AAA', clearLamp: Lamp.Clear, exScore: 3057 },
      ], // Miss1
      [
        { exScore: 3057, rank: 'AAA' },
        { score: 999010, rank: 'AAA', clearLamp: Lamp.Assisted, exScore: 3057 },
      ], // Miss1
      [
        { exScore: 3057, clearLamp: Lamp.Failed },
        { score: 999010, rank: 'E', clearLamp: Lamp.Failed, exScore: 3057 },
      ], // Miss1 (Failed)
      [
        { exScore: 3057, rank: 'E' },
        { score: 999010, rank: 'E', clearLamp: Lamp.Failed, exScore: 3057 },
      ], // Miss1 (Failed)
      [
        { score: 999000, clearLamp: Lamp.Clear },
        { score: 999000, rank: 'AAA', clearLamp: Lamp.Clear, exScore: 3056 },
      ], // Miss1 P1
      [
        { score: 999000, clearLamp: Lamp.Failed, maxCombo: 1010 },
        {
          score: 999000,
          rank: 'E',
          clearLamp: Lamp.Failed,
          exScore: 3056,
          maxCombo: 1010,
        },
      ], // Miss1 P1 (missed last FA)
      [
        { score: 948260, clearLamp: Lamp.Life4, maxCombo: 260 },
        { score: 948260, rank: 'AA', clearLamp: Lamp.Life4, maxCombo: 260 },
      ],
      [
        { score: 948260, maxCombo: 260 },
        { score: 948260, rank: 'AA', clearLamp: Lamp.Clear, maxCombo: 260 },
      ],
      [
        { score: 8460, rank: 'E' },
        { score: 8460, rank: 'E', clearLamp: Lamp.Failed },
      ],
      [{ score: 0, clearLamp: Lamp.Failed }, noPlayScore], // 0 point falied
      [{ score: 0, rank: 'E' }, noPlayScore], // 0 point falied
      [
        { score: 0, clearLamp: Lamp.Assisted },
        { ...noPlayScore, rank: 'D', clearLamp: Lamp.Assisted },
      ], // 0 point clear (Maybe use Assist option)
      [
        { score: 0, clearLamp: Lamp.Clear },
        { ...noPlayScore, rank: 'D', clearLamp: Lamp.Assisted },
      ], // 0 point clear (Maybe use Assist option)
      [
        { score: 0, rank: 'D' },
        { ...noPlayScore, rank: 'D', clearLamp: Lamp.Assisted },
      ], // 0 point clear (Maybe use Assist option)
      [
        { score: 0, clearLamp: Lamp.Clear, flareRank: Flare.I },
        {
          ...noPlayScore,
          rank: 'D',
          clearLamp: Lamp.Clear,
          flareRank: Flare.I,
        },
      ], // 0 point clear (FLARE I Clear)
    ] satisfies [Partial<ScoreRecord>, ScoreRecord][])(
      '({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, %o) returns %o',
      (score, expected) =>
        expect(setValidScoreFromChart(chart, score)).toStrictEqual(expected)
    )
    test('({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, { exScore: 800 }) throws error', () =>
      expect(() =>
        setValidScoreFromChart(chart, { exScore: 800 })
      ).toThrowError(/^Cannot guess Score object. set score property/))
    test.each([
      [
        { score: 993100, clearLamp: Lamp.GFC },
        {
          score: 993100,
          rank: 'AAA',
          clearLamp: Lamp.GFC,
          exScore: 509,
          maxCombo: 180,
        },
      ], // Gr3 P55
      [
        { score: 989100, clearLamp: Lamp.GFC },
        {
          score: 989100,
          rank: 'AA+',
          clearLamp: Lamp.GFC,
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
      [1, Flare.None, 145],
      [2, Flare.None, 155],
      [3, Flare.None, 170],
      [4, Flare.None, 185],
      [5, Flare.None, 205],
      [6, Flare.None, 230],
      [7, Flare.None, 255],
      [8, Flare.None, 290],
      [9, Flare.None, 335],
      [10, Flare.None, 400],
      [11, Flare.None, 465],
      [12, Flare.None, 510],
      [13, Flare.None, 545],
      [14, Flare.None, 575],
      [15, Flare.None, 600],
      [16, Flare.None, 620],
      [17, Flare.None, 635],
      [18, Flare.None, 650],
      [19, Flare.None, 665],
      [1, Flare.EX, 232],
      [2, Flare.EX, 248],
      [3, Flare.EX, 272],
      [4, Flare.EX, 296],
      [5, Flare.EX, 328],
      [6, Flare.EX, 368],
      [7, Flare.EX, 408],
      [8, Flare.EX, 464],
      [9, Flare.EX, 536],
      [10, Flare.EX, 640],
      [11, Flare.EX, 744],
      [12, Flare.EX, 816],
      [13, Flare.EX, 872],
      [14, Flare.EX, 920],
      [15, Flare.EX, 960],
      [16, Flare.EX, 992],
      [17, Flare.EX, 1016],
      [18, Flare.EX, 1040],
      [19, Flare.EX, 1064],
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
        [chart, 1000000, 7],
        [{ marvelousOrOk: 138, perfect: 0, great: 0, good: 0, miss: 0 }],
      ],
      [
        [chart, 999000, 6],
        [{ marvelousOrOk: 38, perfect: 100, great: 0, good: 0, miss: 0 }],
      ],
      [[testSongData.charts[0], 998000, undefined], []],
      [
        [chart, 950360, 5],
        [{ marvelousOrOk: 102, perfect: 19, great: 17, good: 0, miss: 0 }],
      ],
      [
        [chart, 969780, 4],
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
        [chart, 940360, 3],
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
        [{ notes: 300, freezeArrow: 30, shockArrow: 10 }, 984500, undefined],
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
    ] satisfies [
      Parameters<typeof detectJudgeCounts>,
      ReturnType<typeof detectJudgeCounts>,
    ][])('(%o) returns %o', ([chart, score, clearLamp], expected) =>
      expect(detectJudgeCounts(chart, score, clearLamp)).toStrictEqual(expected)
    )
  })
})
