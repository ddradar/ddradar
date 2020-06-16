import {
  calcExScore,
  calcScore,
  getDanceLevel,
  isScore,
  Score,
  setValidScoreFromChart,
} from '../score'

describe('./score.ts', () => {
  describe('isScore', () => {
    const validScore: Score = {
      clearLamp: 2,
      rank: 'AA+',
      score: 978800,
    }
    test.each([undefined, null, true, 1.5, 'foo', {}])(
      '(%p) returns false',
      (obj: unknown) => expect(isScore(obj)).toBe(false)
    )
    test.each([
      validScore,
      { ...validScore, exScore: 334 },
      { ...validScore, maxCombo: 120 },
      { ...validScore, exScore: 334, maxCombo: 120 },
    ])('(%p) returns true', (obj: Score) => expect(isScore(obj)).toBe(true))
    test.each([
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
    ])('(%p) returns false', (obj: unknown) => expect(isScore(obj)).toBe(false))
  })
  describe('setValidScoreFromChart', () => {
    const testChart = { notes: 270, freezeArrow: 20, shockArrow: 10 }

    const mfcScore: Score = {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore: 900,
      maxCombo: 280,
    }
    const pfcScore: Score = {
      score: 999990,
      rank: 'AAA',
      clearLamp: 6,
      exScore: 899,
      maxCombo: 280,
    }
    test.each([
      [{ clearLamp: 7 } as Partial<Score>, mfcScore],
      [{ score: 1000000 }, mfcScore],
      [{ exScore: 900 }, mfcScore],
      [{ score: 999990 }, pfcScore],
      [{ exScore: 899 }, pfcScore],
      [{ score: 999800 }, { ...pfcScore, score: 999800, exScore: 880 }],
      [
        { exScore: 880, clearLamp: 6 },
        { ...pfcScore, score: 999800, exScore: 880 },
      ],
    ])(
      '({ notes: 270, freezeArrow: 20, shockArrow: 10 }, %p) returns %p',
      (incompleteScore: Partial<Score>, expected: Score) =>
        expect(
          setValidScoreFromChart(testChart, incompleteScore)
        ).toStrictEqual(expected)
    )
    test.each([
      [{ exScore: 901 } as Partial<Score>, /^Invalid Score object: exScore/],
      [{ exScore: 800 }, /^Cannot guess Score object. set score property/],
    ])(
      '({ notes: 270, freezeArrow: 20, shockArrow: 10 }, %p) throws error',
      (incompleteScore: Partial<Score>, err) =>
        expect(() =>
          setValidScoreFromChart(testChart, incompleteScore)
        ).toThrowError(err)
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
    test.each([
      -1,
      10.5,
      NaN,
      Infinity,
      -Infinity,
      1000010,
    ])('(%d) throws error', d =>
      expect(() => getDanceLevel(d)).toThrowError(/^Invalid parameter: score/)
    )
  })
  describe('calcScore', () => {
    test.each([
      [
        { notes: 270, freezeArrow: 20, shockArrow: 10 },
        270,
        0,
        0,
        0,
        30,
        1000000,
      ],
      [
        { notes: 270, freezeArrow: 20, shockArrow: 10 },
        70,
        200,
        0,
        0,
        30,
        998000,
      ],
      [
        { notes: 846, freezeArrow: 12, shockArrow: 0 },
        352,
        171,
        103,
        10,
        11,
        693890,
      ],
      [
        { notes: 492, freezeArrow: 36, shockArrow: 0 },
        421,
        66,
        5,
        0,
        36,
        995500,
      ],
    ])(
      '(%p, %i, %i, %i, %i, %i) returns %i',
      (chart, mv, pf, gr, gd, ok, expected) =>
        expect(calcScore(chart, mv, pf, gr, gd, ok)).toBe(expected)
    )
    test.each([
      [-1, 0, 0, 0, 0, /^Invalid parameter: marvelous/],
      [0, 10.5, 0, 0, 0, /^Invalid parameter: perfect/],
      [0, 0, Infinity, 0, 0, /^Invalid parameter: great/],
      [0, 0, 0, -Infinity, 0, /^Invalid parameter: good/],
      [0, 0, 0, 0, NaN, /^Invalid parameter: ok/],
      [201, 0, 0, 0, 0, /^Invalid parameter: judge count\(\d+\) is greater/],
      [200, 0, 0, 0, 21, /^Invalid parameter: okCount\(\d+\) is greater/],
    ])(
      '({ notes: 200, freezeArrow: 20, shockArrow: 0 }, %d, %d, %d, %d, %d) throws error',
      (mv, pf, gr, gd, ok, err) => {
        expect(() =>
          calcScore(
            { notes: 200, freezeArrow: 20, shockArrow: 0 },
            mv,
            pf,
            gr,
            gd,
            ok
          )
        ).toThrowError(err)
      }
    )
  })
  describe('calcExScore', () => {
    test.each([
      [0, 0, 0, 0, 0],
      [144, 99, 100, 45, 865],
      [470, 37, 0, 25, 1559],
    ])('(%i, %i, %i, %i) returns %i', (mv, pf, gr, ok, expected) =>
      expect(calcExScore(mv, pf, gr, ok)).toBe(expected)
    )
    test.each([
      [-1, 0, 0, 0, /^Invalid parameter: marvelous/],
      [0, 10.5, 0, 0, /^Invalid parameter: perfect/],
      [0, 0, Infinity, 0, /^Invalid parameter: great/],
      [0, 0, 0, -Infinity, /^Invalid parameter: ok/],
      [NaN, NaN, NaN, NaN, /^Invalid parameter: marvelous/],
    ])('(%d, %d, %d, %d) throws error', (mv, pf, gr, ok, err) =>
      expect(() => calcExScore(mv, pf, gr, ok)).toThrowError(err)
    )
  })
})
