import { describe, expect, test } from 'vitest'

import type { Score } from '../src/score'
import {
  calcFlareSkill,
  calcMyGrooveRadar,
  createScoreSchema,
  detectJudgeCounts,
  getDanceLevel,
  isScore,
  isValidScore,
  mergeScore,
  setValidScoreFromChart,
} from '../src/score'
import type { StepChartSchema } from '../src/song'
import { publicUser, testCourseData, testSongData } from './data'

describe('score.ts', () => {
  describe('isScore', () => {
    const validScore: Score = {
      clearLamp: 2,
      rank: 'AA+',
      score: 978800,
    }

    test.each([
      undefined,
      null,
      true,
      1.5,
      'foo',
      {},
      { ...validScore, score: Infinity },
      { ...validScore, score: -1 },
      { ...validScore, score: 10000000 },
      { ...validScore, clearLamp: -2 },
      { ...validScore, clearLamp: 8 },
      { ...validScore, rank: '-' },
      { ...validScore, exScore: '334' },
      { ...validScore, maxCombo: true },
      { ...validScore, exScore: 334, maxCombo: {} },
      { ...validScore, exScore: NaN, maxCombo: 120 },
    ])('(%o) returns false', o => expect(isScore(o)).toBe(false))
    test.each([
      validScore,
      { ...validScore, exScore: 334 },
      { ...validScore, maxCombo: 120 },
      { ...validScore, exScore: 334, maxCombo: 120 },
    ])('(%o) returns true', o => expect(isScore(o)).toBe(true))
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
    const baseScore: Score = {
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

  describe('createScoreSchema', () => {
    const songInfo = { ...testSongData, ...testSongData.charts[0] }
    const courseInfo = { ...testCourseData, ...testCourseData.charts[0] }
    const radar = {
      stream: testSongData.charts[0].stream,
      voltage: testSongData.charts[0].voltage,
      air: testSongData.charts[0].air,
      freeze: testSongData.charts[0].freeze,
      chaos: testSongData.charts[0].chaos,
    }

    const scores: Score[] = [
      { score: 1000000, clearLamp: 7, rank: 'AAA' },
      { score: 800000, clearLamp: 3, rank: 'A', maxCombo: 100, exScore: 300 },
    ]
    const areaUser = { id: '13', name: '13', isPublic: false }

    test.each([
      [
        publicUser,
        scores[0],
        {
          ...scores[0],
          exScore:
            (songInfo.notes + songInfo.freezeArrow + songInfo.shockArrow) * 3,
          maxCombo: songInfo.notes + songInfo.shockArrow,
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: publicUser.id,
          userName: publicUser.name,
          isPublic: publicUser.isPublic,
          radar,
        },
      ],
      [
        areaUser,
        scores[1],
        {
          ...scores[1],
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
        },
      ],
    ])('(songInfo, user: %o, scores: %o) returns %o', (user, score, expected) =>
      expect(createScoreSchema(songInfo, user, score)).toStrictEqual(expected)
    )
    test.each([
      [
        publicUser,
        scores[1],
        {
          ...scores[1],
          songId: courseInfo.id,
          songName: courseInfo.name,
          playStyle: courseInfo.playStyle,
          difficulty: courseInfo.difficulty,
          level: courseInfo.level,
          userId: publicUser.id,
          userName: publicUser.name,
          isPublic: publicUser.isPublic,
        },
      ],
      [
        areaUser,
        scores[0],
        {
          ...scores[0],
          exScore:
            (courseInfo.notes +
              courseInfo.freezeArrow +
              courseInfo.shockArrow) *
            3,
          maxCombo: courseInfo.notes + courseInfo.shockArrow,
          songId: courseInfo.id,
          songName: courseInfo.name,
          playStyle: courseInfo.playStyle,
          difficulty: courseInfo.difficulty,
          level: courseInfo.level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
        },
      ],
    ])(
      '(courseInfo, user: %o, scores: %o) returns %o',
      (user, score, expected) =>
        expect(createScoreSchema(courseInfo, user, score)).toStrictEqual(
          expected
        )
    )
    test.each([
      [
        publicUser,
        scores[0],
        {
          ...scores[0],
          exScore:
            (songInfo.notes + songInfo.freezeArrow + songInfo.shockArrow) * 3,
          maxCombo: songInfo.notes + songInfo.shockArrow,
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: publicUser.id,
          userName: publicUser.name,
          isPublic: publicUser.isPublic,
          radar,
          deleted: true,
        },
      ],
      [
        areaUser,
        scores[1],
        {
          ...scores[1],
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
          deleted: true,
        },
      ],
    ])(
      '(deletedSong, user: %o, scores: %o) returns %o',
      (user, score, expected) =>
        expect(
          createScoreSchema({ ...songInfo, deleted: true }, user, score)
        ).toStrictEqual(expected)
    )
  })

  describe('calcMyGrooveRadar', () => {
    const chart: Omit<StepChartSchema, 'playStyle' | 'difficulty' | 'level'> = {
      notes: 150,
      freezeArrow: 50,
      shockArrow: 50,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    }
    const score: Score = { clearLamp: 2, score: 800000, rank: 'A' }
    test('({ freeze: 0 }, score) returns { freeze: 0 }', () =>
      expect(
        calcMyGrooveRadar(
          { ...chart, freezeArrow: 0, freeze: 0 },
          { ...score, clearLamp: 4 }
        ).freeze
      ).toBe(0))
    test.each([
      [score, 80, 0, 0, 0, 0],
      [{ ...score, maxCombo: 100 } as const, 80, 50, 50, 0, 50],
      [{ ...score, clearLamp: 3 } as const, 80, 0, 98, 94, 98],
      [{ ...score, clearLamp: 4 } as const, 80, 100, 100, 100, 100],
    ])(
      '(chart, %o) returns { %i, %i, %i, %i, %i }',
      (score, stream, voltage, air, freeze, chaos) =>
        expect(calcMyGrooveRadar(chart, score)).toStrictEqual({
          stream,
          voltage,
          air,
          freeze,
          chaos,
        })
    )
  })

  describe('setValidScoreFromChart', () => {
    const chart = { notes: 1000, freezeArrow: 10, shockArrow: 10 } as const

    const mfcScore: Score = {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore: 3060,
      maxCombo: 1010,
    }
    /** Perfect:1 Score */
    const pfcScore: Score = {
      ...mfcScore,
      score: 999990,
      clearLamp: 6,
      exScore: 3059,
    }
    /** Great:1 Score */
    const gfcScore: Score = {
      ...pfcScore,
      score: 999590,
      clearLamp: 5,
      exScore: 3058,
    }
    /** Good:1 Score */
    const fcScore: Score = {
      ...gfcScore,
      score: 999200,
      clearLamp: 4,
      exScore: 3057,
    }
    /** 0 point falied Score */
    const noPlayScore: Score = {
      score: 0,
      rank: 'E',
      clearLamp: 0,
      exScore: 0,
      maxCombo: 0,
    }
    test.each([
      [{ clearLamp: 7 } as Partial<Score>, mfcScore], // MFC
      [{ score: 1000000 } as Partial<Score>, mfcScore], // MFC
      [{ exScore: 3060 } as Partial<Score>, mfcScore], // MFC
      [{ score: 999990 } as Partial<Score>, pfcScore], // P1
      [{ exScore: 3059 } as Partial<Score>, pfcScore], // P1
      [
        // Maybe PFC (score is greater than Great:1 score)
        { score: 999600 } as Partial<Score>,
        { ...pfcScore, score: 999600, exScore: 3020 },
      ],
      [
        // P20
        { exScore: 3040, clearLamp: 6 } as Partial<Score>,
        { ...pfcScore, score: 999800, exScore: 3040 },
      ],
      [{ exScore: 3058, clearLamp: 5 } as Partial<Score>, gfcScore], // Gr1
      [{ score: 999590, clearLamp: 5 } as Partial<Score>, gfcScore], // Gr1
      [
        // Gr1 P9
        { score: 999500, clearLamp: 5 } as Partial<Score>,
        { ...gfcScore, score: 999500, exScore: 3049 },
      ],
      [
        // Maybe Great:1 FC (score is greater than Good:1 score)
        { score: 999210 } as Partial<Score>,
        { ...gfcScore, score: 999210, exScore: 3020 },
      ],
      [
        // Cannot guess EX SCORE
        { score: 987600, clearLamp: 5 } as Partial<Score>,
        {
          score: 987600,
          rank: 'AA+',
          clearLamp: 5,
          maxCombo: 1010,
        } as Score,
      ],
      [{ exScore: 3057, clearLamp: 4 } as Partial<Score>, fcScore], // Gd1
      [{ score: 999200, clearLamp: 4 } as Partial<Score>, fcScore], // Gd1
      [
        // Gd1 P20
        { score: 999000, clearLamp: 4 } as Partial<Score>,
        { ...fcScore, score: 999000, exScore: 3037 },
      ],
      [
        // Maybe Full Combo (score is greater than Miss:1 score)
        { score: 999100 } as Partial<Score>,
        {
          score: 999100,
          rank: 'AAA',
          clearLamp: 4,
          maxCombo: 1010,
        } as Score,
      ],
      [
        // Cannot guess EX SCORE
        { score: 987600, clearLamp: 4 } as Partial<Score>,
        {
          score: 987600,
          clearLamp: 4,
          rank: 'AA+',
          maxCombo: 1010,
        } as Score,
      ],
      [
        // Miss1 P1
        { score: 999000, clearLamp: 2 } as Partial<Score>,
        {
          score: 999000,
          rank: 'AAA',
          clearLamp: 2,
          exScore: 3056,
        } as Score,
      ],
      [
        // Miss1 P1 (missed last FA)
        { score: 999000, clearLamp: 0, maxCombo: 1010 } as Partial<Score>,
        {
          score: 999000,
          rank: 'E',
          clearLamp: 0,
          exScore: 3056,
          maxCombo: 1010,
        } as Score,
      ],
      [
        { score: 948260, clearLamp: 3, maxCombo: 260 } as Partial<Score>,
        { score: 948260, rank: 'AA', clearLamp: 3, maxCombo: 260 } as Score,
      ],
      [
        { score: 948260, maxCombo: 260 } as Partial<Score>,
        { score: 948260, rank: 'AA', clearLamp: 2, maxCombo: 260 } as Score,
      ],
      [
        { score: 8460, rank: 'E' } as Partial<Score>,
        { score: 8460, rank: 'E', clearLamp: 0 } as Score,
      ],
      [{ score: 0, clearLamp: 0 } as Partial<Score>, noPlayScore], // 0 point
      [{ score: 0, rank: 'E' } as Partial<Score>, noPlayScore], // 0 point
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, clearLamp: 1 } as Partial<Score>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as Score,
      ],
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, clearLamp: 2 } as Partial<Score>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as Score,
      ],
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, rank: 'D' } as Partial<Score>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as Score,
      ],
    ])(
      '({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, %o) returns %o',
      (score: Partial<Score>, expected: Score) =>
        expect(setValidScoreFromChart(chart, score)).toStrictEqual(expected)
    )
    test('({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, { exScore: 800 }) throws error', () =>
      expect(() =>
        setValidScoreFromChart(chart, { exScore: 800 })
      ).toThrowError(/^Cannot guess Score object. set score property/))
    test.each([
      [
        { score: 993100, clearLamp: 5 } as Partial<Score>, // Gr3 P55
        {
          score: 993100,
          rank: 'AAA',
          clearLamp: 5,
          exScore: 509,
          maxCombo: 180,
        } as Score,
      ],
      [
        { score: 989100, clearLamp: 5 } as Partial<Score>, // Gr5 P32
        {
          score: 989100,
          rank: 'AA+',
          clearLamp: 5,
          exScore: 528,
          maxCombo: 180,
        } as Score,
      ],
    ])(
      '({ notes: 180, freezeArrow: 10, shockArrow: 0 }, %o) returns %o',
      (incompleteScore: Partial<Score>, expected: Score) => {
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
      `(%d) throws error`,
      d => expect(() => calcFlareSkill(d)).toThrowError()
    )

    test.each([
      [1, 145],
      [2, 155],
      [3, 170],
      [4, 185],
      [5, 205],
      [6, 230],
      [7, 255],
      [8, 290],
      [9, 335],
      [10, 400],
      [11, 465],
      [12, 510],
      [13, 545],
      [14, 575],
      [15, 600],
      [16, 620],
      [17, 635],
      [18, 650],
      [19, 665],
    ])(`(%d) returns %d`, (d, expected) =>
      expect(calcFlareSkill(d)).toBe(expected)
    )

    test.each([
      [1, 232],
      [2, 248],
      [3, 272],
      [4, 296],
      [5, 328],
      [6, 368],
      [7, 408],
      [8, 464],
      [9, 536],
      [10, 640],
      [11, 744],
      [12, 816],
      [13, 872],
      [14, 920],
      [15, 960],
      [16, 992],
      [17, 1016],
      [18, 1040],
      [19, 1064],
    ])(`(%d, 10) returns %d`, (d, expected) =>
      expect(calcFlareSkill(d, 10)).toBe(expected)
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
        [{ marvelousOrOk: 68, perfect: 53, great: 17, good: 0, miss: 0 }],
      ],
      [
        chart,
        969780,
        4 as const,
        [
          { marvelousOrOk: 5, perfect: 128, great: 0, good: 5, miss: 0 },
          { marvelousOrOk: 3, perfect: 129, great: 2, good: 4, miss: 0 },
          { marvelousOrOk: 1, perfect: 130, great: 4, good: 3, miss: 0 },
        ],
      ],
      [
        chart,
        940360,
        3 as const,
        [
          { marvelousOrOk: 100, perfect: 28, great: 1, good: 6, miss: 3 },
          { marvelousOrOk: 98, perfect: 30, great: 0, good: 9, miss: 1 },
          { marvelousOrOk: 98, perfect: 29, great: 3, good: 5, miss: 3 },
          { marvelousOrOk: 96, perfect: 31, great: 2, good: 8, miss: 1 },
          { marvelousOrOk: 96, perfect: 30, great: 5, good: 4, miss: 3 },
          { marvelousOrOk: 94, perfect: 32, great: 4, good: 7, miss: 1 },
          { marvelousOrOk: 94, perfect: 31, great: 7, good: 3, miss: 3 },
          { marvelousOrOk: 92, perfect: 33, great: 6, good: 6, miss: 1 },
          { marvelousOrOk: 92, perfect: 32, great: 9, good: 2, miss: 3 },
          { marvelousOrOk: 90, perfect: 34, great: 8, good: 5, miss: 1 },
          { marvelousOrOk: 90, perfect: 33, great: 11, good: 1, miss: 3 },
          { marvelousOrOk: 88, perfect: 35, great: 10, good: 4, miss: 1 },
          { marvelousOrOk: 88, perfect: 34, great: 13, good: 0, miss: 3 },
          { marvelousOrOk: 86, perfect: 36, great: 12, good: 3, miss: 1 },
          { marvelousOrOk: 84, perfect: 37, great: 14, good: 2, miss: 1 },
          { marvelousOrOk: 82, perfect: 38, great: 16, good: 1, miss: 1 },
          { marvelousOrOk: 80, perfect: 39, great: 18, good: 0, miss: 1 },
        ],
      ],
      [
        { notes: 300, freezeArrow: 30, shockArrow: 10 },
        984500,
        undefined,
        [
          { marvelousOrOk: 312, perfect: 22, great: 1, good: 1, miss: 4 },
          { marvelousOrOk: 310, perfect: 24, great: 0, good: 4, miss: 2 },
          { marvelousOrOk: 310, perfect: 23, great: 3, good: 0, miss: 4 },
          { marvelousOrOk: 308, perfect: 25, great: 2, good: 3, miss: 2 },
          { marvelousOrOk: 306, perfect: 27, great: 1, good: 6, miss: 0 },
          { marvelousOrOk: 306, perfect: 26, great: 4, good: 2, miss: 2 },
          { marvelousOrOk: 304, perfect: 28, great: 3, good: 5, miss: 0 },
          { marvelousOrOk: 304, perfect: 27, great: 6, good: 1, miss: 2 },
          { marvelousOrOk: 302, perfect: 29, great: 5, good: 4, miss: 0 },
          { marvelousOrOk: 302, perfect: 28, great: 8, good: 0, miss: 2 },
          { marvelousOrOk: 300, perfect: 30, great: 7, good: 3, miss: 0 },
          { marvelousOrOk: 298, perfect: 31, great: 9, good: 2, miss: 0 },
          { marvelousOrOk: 296, perfect: 32, great: 11, good: 1, miss: 0 },
          { marvelousOrOk: 294, perfect: 33, great: 13, good: 0, miss: 0 },
          { marvelousOrOk: 256, perfect: 79, great: 0, good: 0, miss: 5 },
          { marvelousOrOk: 252, perfect: 82, great: 1, good: 2, miss: 3 },
          { marvelousOrOk: 250, perfect: 84, great: 0, good: 5, miss: 1 },
          { marvelousOrOk: 250, perfect: 83, great: 3, good: 1, miss: 3 },
          { marvelousOrOk: 248, perfect: 85, great: 2, good: 4, miss: 1 },
          { marvelousOrOk: 248, perfect: 84, great: 5, good: 0, miss: 3 },
          { marvelousOrOk: 246, perfect: 86, great: 4, good: 3, miss: 1 },
          { marvelousOrOk: 244, perfect: 87, great: 6, good: 2, miss: 1 },
          { marvelousOrOk: 242, perfect: 88, great: 8, good: 1, miss: 1 },
          { marvelousOrOk: 240, perfect: 89, great: 10, good: 0, miss: 1 },
          { marvelousOrOk: 196, perfect: 139, great: 0, good: 1, miss: 4 },
          { marvelousOrOk: 194, perfect: 140, great: 2, good: 0, miss: 4 },
          { marvelousOrOk: 192, perfect: 142, great: 1, good: 3, miss: 2 },
          { marvelousOrOk: 190, perfect: 144, great: 0, good: 6, miss: 0 },
          { marvelousOrOk: 190, perfect: 143, great: 3, good: 2, miss: 2 },
          { marvelousOrOk: 188, perfect: 145, great: 2, good: 5, miss: 0 },
          { marvelousOrOk: 188, perfect: 144, great: 5, good: 1, miss: 2 },
          { marvelousOrOk: 186, perfect: 146, great: 4, good: 4, miss: 0 },
          { marvelousOrOk: 186, perfect: 145, great: 7, good: 0, miss: 2 },
          { marvelousOrOk: 184, perfect: 147, great: 6, good: 3, miss: 0 },
          { marvelousOrOk: 182, perfect: 148, great: 8, good: 2, miss: 0 },
          { marvelousOrOk: 180, perfect: 149, great: 10, good: 1, miss: 0 },
          { marvelousOrOk: 178, perfect: 150, great: 12, good: 0, miss: 0 },
          { marvelousOrOk: 136, perfect: 199, great: 0, good: 2, miss: 3 },
          { marvelousOrOk: 134, perfect: 200, great: 2, good: 1, miss: 3 },
          { marvelousOrOk: 132, perfect: 202, great: 1, good: 4, miss: 1 },
          { marvelousOrOk: 132, perfect: 201, great: 4, good: 0, miss: 3 },
          { marvelousOrOk: 130, perfect: 203, great: 3, good: 3, miss: 1 },
          { marvelousOrOk: 128, perfect: 204, great: 5, good: 2, miss: 1 },
          { marvelousOrOk: 126, perfect: 205, great: 7, good: 1, miss: 1 },
          { marvelousOrOk: 124, perfect: 206, great: 9, good: 0, miss: 1 },
          { marvelousOrOk: 79, perfect: 256, great: 1, good: 0, miss: 4 },
          { marvelousOrOk: 77, perfect: 258, great: 0, good: 3, miss: 2 },
          { marvelousOrOk: 75, perfect: 259, great: 2, good: 2, miss: 2 },
          { marvelousOrOk: 73, perfect: 261, great: 1, good: 5, miss: 0 },
          { marvelousOrOk: 73, perfect: 260, great: 4, good: 1, miss: 2 },
          { marvelousOrOk: 71, perfect: 262, great: 3, good: 4, miss: 0 },
          { marvelousOrOk: 71, perfect: 261, great: 6, good: 0, miss: 2 },
          { marvelousOrOk: 69, perfect: 263, great: 5, good: 3, miss: 0 },
          { marvelousOrOk: 67, perfect: 264, great: 7, good: 2, miss: 0 },
          { marvelousOrOk: 65, perfect: 265, great: 9, good: 1, miss: 0 },
          { marvelousOrOk: 63, perfect: 266, great: 11, good: 0, miss: 0 },
          { marvelousOrOk: 19, perfect: 316, great: 1, good: 1, miss: 3 },
          { marvelousOrOk: 17, perfect: 318, great: 0, good: 4, miss: 1 },
          { marvelousOrOk: 17, perfect: 317, great: 3, good: 0, miss: 3 },
          { marvelousOrOk: 15, perfect: 319, great: 2, good: 3, miss: 1 },
          { marvelousOrOk: 13, perfect: 320, great: 4, good: 2, miss: 1 },
          { marvelousOrOk: 11, perfect: 321, great: 6, good: 1, miss: 1 },
          { marvelousOrOk: 9, perfect: 322, great: 8, good: 0, miss: 1 },
        ],
      ],
    ])('(%o, %i, %i) returns %o', (chart, score, clearLamp, expected) =>
      expect(detectJudgeCounts(chart, score, clearLamp)).toStrictEqual(expected)
    )
  })
})
