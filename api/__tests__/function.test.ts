import { describe, expect, test } from '@jest/globals'

import { getBindingNumber } from '../function'

describe('./function.ts', () => {
  describe('getBindingNumber', () => {
    test.each([
      [1, 1],
      [-1, -1],
      [0, 0],
      [NaN, NaN],
      [{ string: '0', data: 'string' }, 0],
    ])('({ key: %p }, "key") returns %d', (key, num) =>
      expect(getBindingNumber({ key }, 'key')).toBe(num)
    )
  })
})
