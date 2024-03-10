// @vitest-environment node
import { describe, expect, test } from 'vitest'

import { getDisplayedBPM, shortenSeriesName } from '~/utils/song'

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
