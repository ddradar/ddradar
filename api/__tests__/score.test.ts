import {
  getDanceLevel,
  isScore,
  isValidScore,
  mergeScore,
  Score,
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
  describe('mergeScore', () => {
    test.each([
      [
        { score: 900000, clearLamp: 3, rank: 'AA' },
        { score: 850000, clearLamp: 4, exScore: 100, rank: 'A+' },
        { score: 900000, clearLamp: 4, rank: 'AA', exScore: 100 },
      ],
      [
        { score: 900000, clearLamp: 3, rank: 'AA' },
        { score: 920000, clearLamp: 0, rank: 'E' },
        { score: 920000, clearLamp: 3, rank: 'E' },
      ],
      [
        { score: 900000, clearLamp: 3, rank: 'AA' },
        { score: 850000, clearLamp: 4, maxCombo: 100, rank: 'A+' },
        { score: 900000, clearLamp: 4, rank: 'AA', maxCombo: 100 },
      ],
    ] as const)('(%p, %p) returns %p', (left, right, expected) => {
      // Assert - Act
      const merged1 = mergeScore(left, right)
      const merged2 = mergeScore(right, left)

      // Assert
      expect(merged1).toStrictEqual(expected)
      expect(merged2).toStrictEqual(expected)
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
    ])('(chart, %p) returns false', score => {
      expect(isValidScore(chart, score)).toBe(false)
    })
    test.each([
      baseScore,
      { ...baseScore, exScore: 200 },
      { ...baseScore, clearLamp: 7, exScore: 390 },
      { ...baseScore, clearLamp: 6, exScore: 389 },
      { ...baseScore, clearLamp: 5, exScore: 388 },
      { ...baseScore, maxCombo: 110 },
      { ...baseScore, clearLamp: 3, maxCombo: 110 },
    ] as const)('(chart, %p) returns true', score => {
      expect(isValidScore(chart, score)).toBe(true)
    })
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
})
