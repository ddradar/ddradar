// @vitest-environment node
import { describe, expect, test } from 'vitest'

import { getDisplayedBPM } from '~/utils/song'

describe('utils/song.ts', () => {
  describe('getDisplayedBPM', () => {
    test.each([
      [200, 200, '200'],
      [100, 400, '100-400'],
    ])(
      '({ minBPM: %o, maxBPM: %o }) returns "%s"',
      (minBPM, maxBPM, expected) =>
        expect(getDisplayedBPM({ minBPM, maxBPM })).toBe(expected)
    )
  })
})
