import { describe, expect, test } from 'vitest'

import { getQueryInteger, getQueryString } from '~/src/path'

describe('server/utils.ts', () => {
  describe('getQueryString', () => {
    test.each([
      [{ key: 'foo' }, 'key', 'foo'],
      [{ key: 'foo' }, 'invalidKey', undefined],
      [{ key: ['foo', 'bar'] }, 'key', 'bar'],
    ])('(%o, %s) returns %s', (query, key, expected) => {
      expect(getQueryString(query, key)).toBe(expected)
    })
  })

  describe('getQueryInteger', () => {
    test.each([
      [{ key: '1' }, 'invalidKey', NaN],
      [{ key: 'foo' }, 'key', NaN],
      [{ key: '1' }, 'key', 1],
      [{ key: '-1' }, 'key', -1],
      [{ key: '0.1' }, 'key', NaN],
      [{ key: ['foo', '1'] }, 'key', 1],
    ])('(%o, "%s") returns %i', (query, key, expected) => {
      expect(getQueryInteger(query, key)).toBe(expected)
    })
  })
})
