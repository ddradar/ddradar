import { describe, expect, test } from 'vitest'

import type { Score } from '../src/score'
import {
  calcFlareSkill,
  calcMyGrooveRadar,
  createScoreSchema,
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
})
