// @vitest-environment node
import { describe, expect, test } from 'vitest'

import {
  getChartTitle,
  getDisplayedBPM,
  shortenSeriesName,
} from '~~/utils/song'

describe('utils/song.ts', () => {
  describe('shortenSeriesName', () => {
    test.each([
      ['DDR 1st', '1st'],
      ['DDRMAX', 'DDRMAX'],
      ['DanceDanceRevolution (2014)', '2014'],
      ['DanceDanceRevolution A20', 'A20'],
      ['DanceDanceRevolution A20 PLUS', 'A20 PLUS'],
    ])('("%s") returns "%s"', (series, expected) =>
      expect(shortenSeriesName(series)).toBe(expected)
    )
  })

  describe('getChartTitle', () => {
    test.each([
      [1, 0, 1, 'SP-BEGINNER (1)'],
      [2, 1, 5, 'DP-BASIC (5)'],
      [1, 2, 10, 'SP-DIFFICULT (10)'],
      [2, 3, 15, 'DP-EXPERT (15)'],
      [1, 4, 19, 'SP-CHALLENGE (19)'],
    ] as const)(
      '({ playStyle: %i, difficulty: %i, level: %i }) returns "%s"',
      (playStyle, difficulty, level, expected) =>
        expect(getChartTitle({ playStyle, difficulty, level })).toBe(expected)
    )
  })

  describe('getDisplayedBPM', () => {
    test.each([
      [null, null, '???'],
      [100, null, '???'],
      [null, 400, '???'],
      [200, 200, '200'],
      [100, 400, '100-400'],
    ])(
      '({ minBPM: %o, maxBPM: %o }) returns "%s"',
      (minBPM, maxBPM, expected) =>
        expect(getDisplayedBPM({ minBPM, maxBPM })).toBe(expected)
    )
  })
})
