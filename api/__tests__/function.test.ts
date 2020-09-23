import { getBindingNumber, getBindingString } from '../function'

describe('./function.ts', () => {
  describe('getBindingNumber', () => {
    test.each([
      [1, 1],
      [-1, -1],
      [0, 0],
      [NaN, NaN],
      [{ string: '0', data: 'string' }, 0],
    ])('({ key: %p }, "key") returns %d', (key, num) => {
      expect(getBindingNumber({ key }, 'key')).toBe(num)
    })
  })
  describe('getBindingString', () => {
    test.each([
      ['', ''],
      ['foo', 'foo'],
      [{ string: '0', data: 'string' }, '0'],
    ])('({ key: %p }, "key") returns %d', (key, str) => {
      expect(getBindingString({ key }, 'key')).toBe(str)
    })
  })
})
