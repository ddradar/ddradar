import { describe, expect, test } from 'vitest'

import { ClearLamp, FlareRank } from '#shared/schemas/score'
import {
  calcFlareSkill,
  fillScoreRecordFromChart,
  hasNotesInfo,
  ValidateScoreRecord,
} from '#shared/utils/score'

describe('/shared/utils/score', () => {
  describe('hasNotesInfo', () => {
    test.each([
      {},
      { notes: 100 },
      { freezes: 50 },
      { shocks: 25 },
      { notes: null, freezes: 50, shocks: 25 },
      { notes: 100, freezes: null, shocks: 25 },
      { notes: 100, freezes: 50, shocks: null },
    ])('(%o) returns false', chart => expect(hasNotesInfo(chart)).toBe(false))

    test.each([
      { notes: 100, freezes: 50, shocks: 25 },
      { notes: 0, freezes: 0, shocks: 0 },
    ])('(%o) returns true', chart => expect(hasNotesInfo(chart)).toBe(true))
  })

  describe('calcFlareSkill', () => {
    test.each([0, -1, 1.1, 21, NaN, Infinity, -Infinity])(
      `(%d, 0) throws error`,
      d =>
        expect(() => calcFlareSkill(d, FlareRank.None)).toThrow(
          /"Invalid input"/
        )
    )

    test.each([
      [1, FlareRank.None, 145],
      [2, FlareRank.None, 155],
      [3, FlareRank.None, 170],
      [4, FlareRank.None, 185],
      [5, FlareRank.None, 205],
      [6, FlareRank.None, 230],
      [7, FlareRank.None, 255],
      [8, FlareRank.None, 290],
      [9, FlareRank.None, 335],
      [10, FlareRank.None, 400],
      [11, FlareRank.None, 465],
      [12, FlareRank.None, 510],
      [13, FlareRank.None, 545],
      [14, FlareRank.None, 575],
      [15, FlareRank.None, 600],
      [16, FlareRank.None, 620],
      [17, FlareRank.None, 635],
      [18, FlareRank.None, 650],
      [19, FlareRank.None, 665],
      [20, FlareRank.None, 0], // level 20 returns 0
      [1, FlareRank.EX, 232],
      [2, FlareRank.EX, 248],
      [3, FlareRank.EX, 272],
      [4, FlareRank.EX, 296],
      [5, FlareRank.EX, 328],
      [6, FlareRank.EX, 368],
      [7, FlareRank.EX, 408],
      [8, FlareRank.EX, 464],
      [9, FlareRank.EX, 536],
      [10, FlareRank.EX, 640],
      [11, FlareRank.EX, 744],
      [12, FlareRank.EX, 816],
      [13, FlareRank.EX, 872],
      [14, FlareRank.EX, 920],
      [15, FlareRank.EX, 960],
      [16, FlareRank.EX, 992],
      [17, FlareRank.EX, 1016],
      [18, FlareRank.EX, 1040],
      [19, FlareRank.EX, 1064],
      [20, FlareRank.EX, 0], // level 20 returns 0
    ])(`(%d, %d) returns %d`, (level, flareRank, expected) =>
      expect(calcFlareSkill(level, flareRank)).toBe(expected)
    )
  })

  describe('isValidScoreRecord', () => {
    const chart = {
      level: 12,
      notes: 100,
      freezes: 20,
      shocks: 10,
    }
    const baseScore: ScoreRecord = {
      normalScore: 900000,
      clearLamp: ClearLamp.FC,
      rank: 'AA',
      flareRank: FlareRank.None,
      exScore: null,
      maxCombo: null,
      flareSkill: null,
    }

    test.each([
      [
        { ...baseScore, exScore: 1000 },
        [
          {
            field: 'exScore',
            message: 'exScore is too high (up to 390, but 1000)',
          },
        ],
      ],
      [
        { ...baseScore, maxCombo: 1000 },
        [
          {
            field: 'maxCombo',
            message: 'maxCombo is too high (up to 110, but 1000)',
          },
        ],
      ],
      [
        { ...baseScore, exScore: 390 },
        [
          {
            field: 'exScore',
            message:
              'exScore: 390(MAX) is mismatched with clearLamp (expected clearLamp: 7)',
          },
        ],
      ],
      [
        { ...baseScore, exScore: 389 },
        [
          {
            field: 'exScore',
            message:
              'exScore: 389(MAX-1) is mismatched with clearLamp (expected clearLamp: 6)',
          },
        ],
      ],
      [
        { ...baseScore, exScore: 388 },
        [
          {
            field: 'exScore',
            message:
              'exScore: 388(MAX-2) is mismatched with clearLamp (expected clearLamp: 5 or 6)',
          },
        ],
      ],
    ])('(chart, %o) returns %o', (score, expected) =>
      expect(ValidateScoreRecord(chart, score)).toStrictEqual(expected)
    )

    test.each([
      baseScore,
      { ...baseScore, exScore: 200 },
      { ...baseScore, clearLamp: ClearLamp.MFC, exScore: 390 },
      { ...baseScore, clearLamp: ClearLamp.PFC, exScore: 389 },
      { ...baseScore, clearLamp: ClearLamp.GFC, exScore: 388 },
      { ...baseScore, maxCombo: 110 },
      { ...baseScore, clearLamp: ClearLamp.Life4, maxCombo: 110 },
    ] as const)('(chart, %o) returns []', score =>
      expect(ValidateScoreRecord(chart, score)).toStrictEqual([])
    )
  })

  describe('fillScoreRecordFromChart', () => {
    const chart = { notes: 1000, freezes: 10, shocks: 10 }

    const mfcScore: ScoreRecord = {
      normalScore: 1000000,
      rank: 'AAA',
      clearLamp: ClearLamp.MFC,
      exScore: 3060,
      maxCombo: 1010,
      flareRank: FlareRank.None,
      flareSkill: null,
    }
    /** Perfect:1 Score */
    const pfcScore: ScoreRecord = {
      ...mfcScore,
      normalScore: 999990,
      clearLamp: ClearLamp.PFC,
      exScore: 3059,
    }
    /** Great:1 Score */
    const gfcScore: ScoreRecord = {
      ...pfcScore,
      normalScore: 999590,
      clearLamp: ClearLamp.GFC,
      exScore: 3058,
    }
    /** Good:1 Score */
    const fcScore: ScoreRecord = {
      ...gfcScore,
      normalScore: 999200,
      clearLamp: ClearLamp.FC,
      exScore: 3057,
    }
    /** 0 point falied Score */
    const noPlayScore: ScoreRecord = {
      normalScore: 0,
      rank: 'E',
      clearLamp: ClearLamp.Failed,
      exScore: 0,
      maxCombo: 0,
      flareRank: FlareRank.None,
      flareSkill: null,
    }

    test.each([
      [{ clearLamp: ClearLamp.MFC }, mfcScore], // MFC
      [{ normalScore: 1000000 }, mfcScore], // MFC
      [{ exScore: 3060 }, mfcScore], // MFC
      [{ normalScore: 999990 }, pfcScore], // P1
      [{ exScore: 3059 }, pfcScore], // P1
      [
        { normalScore: 999600, flareRank: FlareRank.EX, flareSkill: 328 },
        {
          ...pfcScore,
          normalScore: 999600,
          exScore: 3020,
          flareRank: FlareRank.EX,
          flareSkill: 328,
        },
      ], // Maybe PFC (score is greater than Great:1 score)
      [
        { exScore: 3040, clearLamp: ClearLamp.PFC },
        { ...pfcScore, normalScore: 999800, exScore: 3040 },
      ], // P20
      [
        { exScore: 3041, clearLamp: ClearLamp.PFC, normalScore: 999800 },
        { ...pfcScore, normalScore: 999800, exScore: 3041 },
      ], // P20, but EX SCORE is higher
      [{ exScore: 3058, clearLamp: ClearLamp.GFC }, gfcScore], // Gr1
      [
        { normalScore: 999500, clearLamp: ClearLamp.GFC },
        { ...gfcScore, normalScore: 999500, exScore: 3049 },
      ], // Gr1 P9
      [
        { normalScore: 999210 },
        {
          normalScore: 999210,
          rank: 'AAA',
          clearLamp: ClearLamp.GFC,
          maxCombo: 1010,
          flareRank: FlareRank.None,
          flareSkill: null,
          exScore: null,
        },
      ], // GFC or above (score is greater than Good:1 score)
      [
        { normalScore: 987600, clearLamp: ClearLamp.GFC },
        {
          normalScore: 987600,
          rank: 'AA+',
          clearLamp: ClearLamp.GFC,
          maxCombo: 1010,
          flareRank: FlareRank.None,
          flareSkill: null,
          exScore: null,
        },
      ], // Cannot guess EX SCORE
      [{ exScore: 3057, clearLamp: ClearLamp.FC }, fcScore], // Gd1
      [{ normalScore: 999200, clearLamp: ClearLamp.FC }, fcScore], // Gd1
      [
        { normalScore: 999000, clearLamp: ClearLamp.FC },
        { ...fcScore, normalScore: 999000, exScore: 3037 },
      ], // Gd1 P20
      [
        { normalScore: 999100 },
        {
          normalScore: 999100,
          rank: 'AAA',
          clearLamp: ClearLamp.FC,
          maxCombo: 1010,
          flareRank: FlareRank.None,
          flareSkill: null,
          exScore: null,
        },
      ], // Maybe Full Combo or above (score is greater than Miss:1 score)
      [
        { normalScore: 987600, clearLamp: ClearLamp.FC },
        {
          normalScore: 987600,
          clearLamp: ClearLamp.FC,
          rank: 'AA+',
          maxCombo: 1010,
          flareRank: FlareRank.None,
          flareSkill: null,
          exScore: null,
        },
      ], // Cannot guess EX SCORE
      [
        { exScore: 3057, clearLamp: ClearLamp.Clear },
        {
          normalScore: 999010,
          rank: 'AAA',
          clearLamp: ClearLamp.Clear,
          exScore: 3057,
          flareRank: FlareRank.None,
          flareSkill: null,
          maxCombo: null,
        },
      ], // Miss1
      [
        { exScore: 3057, rank: 'AAA' },
        {
          normalScore: 999010,
          rank: 'AAA',
          clearLamp: ClearLamp.Assisted,
          exScore: 3057,
          flareRank: FlareRank.None,
          flareSkill: null,
          maxCombo: null,
        },
      ], // Miss1
      [
        { exScore: 3057, clearLamp: ClearLamp.Failed, maxCombo: 1000 },
        {
          normalScore: 999010,
          rank: 'E',
          clearLamp: ClearLamp.Failed,
          exScore: 3057,
          flareRank: FlareRank.None,
          flareSkill: null,
          maxCombo: 1000,
        },
      ], // Miss1 (Failed)
      [
        { exScore: 3057, rank: 'E' },
        {
          normalScore: 999010,
          rank: 'E',
          clearLamp: ClearLamp.Failed,
          exScore: 3057,
          flareRank: FlareRank.None,
          flareSkill: null,
          maxCombo: null,
        },
      ], // Miss1 (Failed)
      [
        { normalScore: 999000, clearLamp: ClearLamp.Clear },
        {
          normalScore: 999000,
          rank: 'AAA',
          clearLamp: ClearLamp.Clear,
          exScore: 3056,
          flareRank: FlareRank.None,
          flareSkill: null,
          maxCombo: null,
        },
      ], // Miss1 P1
      [
        { normalScore: 999000, clearLamp: ClearLamp.Failed, maxCombo: 1010 },
        {
          normalScore: 999000,
          rank: 'E',
          clearLamp: ClearLamp.Failed,
          exScore: 3056,
          maxCombo: 1010,
          flareRank: FlareRank.None,
          flareSkill: null,
        },
      ], // Miss1 P1 (missed last FA)
      [
        { normalScore: 948260, clearLamp: ClearLamp.Life4, maxCombo: 260 },
        {
          normalScore: 948260,
          rank: 'AA',
          clearLamp: ClearLamp.Life4,
          maxCombo: 260,
          flareRank: FlareRank.None,
          flareSkill: null,
          exScore: null,
        },
      ],
      [
        { normalScore: 948260, maxCombo: 260 },
        {
          normalScore: 948260,
          rank: 'AA',
          clearLamp: ClearLamp.Clear,
          maxCombo: 260,
          flareRank: FlareRank.None,
          flareSkill: null,
          exScore: null,
        },
      ],
      [
        { normalScore: 8460, rank: 'E' },
        {
          normalScore: 8460,
          rank: 'E',
          clearLamp: ClearLamp.Failed,
          flareRank: FlareRank.None,
          flareSkill: null,
          exScore: null,
          maxCombo: null,
        },
      ],
      [{ normalScore: 0, clearLamp: ClearLamp.Failed }, noPlayScore], // 0 point falied
      [{ normalScore: 0, rank: 'E' }, noPlayScore], // 0 point falied
      [
        { normalScore: 0, clearLamp: ClearLamp.Assisted },
        { ...noPlayScore, rank: 'D', clearLamp: ClearLamp.Assisted },
      ], // 0 point clear (Maybe use Assist option)
      [
        { normalScore: 0, clearLamp: ClearLamp.Clear },
        { ...noPlayScore, rank: 'D', clearLamp: ClearLamp.Assisted },
      ], // 0 point clear (Maybe use Assist option)
      [
        { normalScore: 0, rank: 'D' },
        { ...noPlayScore, rank: 'D', clearLamp: ClearLamp.Assisted },
      ], // 0 point clear (Maybe use Assist option)
      [
        { normalScore: 0, clearLamp: ClearLamp.Clear, flareRank: FlareRank.I },
        {
          ...noPlayScore,
          rank: 'D',
          clearLamp: ClearLamp.Clear,
          flareRank: FlareRank.I,
          flareSkill: null,
        },
      ], // 0 point clear (FLARE I Clear)
      [{ exScore: 800 }, { exScore: 800 }], // Cannot guess anything
    ] satisfies [Partial<ScoreRecord>, Partial<ScoreRecord>][])(
      '({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, %o) returns %o',
      (score: Partial<ScoreRecord>, expected: Partial<ScoreRecord>) =>
        expect(fillScoreRecordFromChart(chart, score)).toStrictEqual(expected)
    )

    test.each([
      [
        { normalScore: 993100, clearLamp: ClearLamp.GFC },
        {
          normalScore: 993100,
          rank: 'AAA',
          clearLamp: ClearLamp.GFC,
          exScore: 509,
          maxCombo: 180,
          flareRank: FlareRank.None,
          flareSkill: null,
        },
      ], // Gr3 P55
      [
        { normalScore: 989100, clearLamp: ClearLamp.GFC },
        {
          normalScore: 989100,
          rank: 'AA+',
          clearLamp: ClearLamp.GFC,
          exScore: 528,
          maxCombo: 180,
          flareRank: FlareRank.None,
          flareSkill: null,
        },
      ], // Gr5 P32
    ] satisfies [Partial<ScoreRecord>, ScoreRecord][])(
      '({ notes: 180, freezeArrow: 10, shockArrow: 0 }, %o) returns %o',
      (incompleteScore: Partial<ScoreRecord>, expected: ScoreRecord) => {
        // Arrange
        const chart = { notes: 180, freezes: 10, shocks: 0 }

        // Act
        const actual = fillScoreRecordFromChart(chart, incompleteScore)

        // Assert
        expect(actual).toStrictEqual(expected)
      }
    )
  })
})
