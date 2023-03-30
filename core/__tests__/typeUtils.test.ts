import { describe, expect, test } from 'vitest'

import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../src/typeUtils'

describe('./typeUtils.ts', () => {
  const objects = [undefined, null, true, 1.5, 'foo', {}, [], { foo1: 'bar' }]

  describe('hasProperty', () => {
    test.each([...objects])('(%o, "foo") returns false', (obj: unknown) =>
      expect(hasProperty(obj, 'foo')).toBe(false)
    )
    test.each([...objects])(
      '({ foo: %o }, "foo") returns true',
      (foo: unknown) => expect(hasProperty({ foo }, 'foo')).toBe(true)
    )
    test.each([...objects])(
      '({ foo: %o }, "foo", "bar") returns false',
      (foo: unknown) => expect(hasProperty({ foo }, 'foo', 'bar')).toBe(false)
    )

    const testData = [
      [undefined, undefined],
      [null, null],
      [true, false],
      [1.5, NaN],
      ['foo', 'bar'],
      [{}, {}],
      [[], []],
      [{ foo1: 'bar' }, { foo2: 'bar' }],
    ] as [unknown, unknown][]
    test.each(testData)(
      '({ foo: %o, bar: %o }, "foo", "bar") returns true',
      (foo, bar) => {
        expect(hasProperty({ foo, bar }, 'foo', 'bar')).toBe(true)
      }
    )
    test.each(testData)(
      '({ foo: %o, bar: %o }, "foo") returns true',
      (foo, bar) => {
        expect(hasProperty({ foo, bar }, 'foo')).toBe(true)
      }
    )
  })

  describe('hasStringProperty', () => {
    test.each([...objects])('(%o, "foo") returns false', (obj: unknown) =>
      expect(hasStringProperty(obj, 'foo')).toBe(false)
    )
    test.each([...objects.filter(o => typeof o !== 'string')])(
      '({ foo: %o }, "foo") returns false',
      (foo: Exclude<unknown, string>) =>
        expect(hasStringProperty({ foo }, 'foo')).toBe(false)
    )
    test.each(['', 'foo', 'bar'])(
      '({ foo: %o }, "foo") returns true',
      (foo: string) => expect(hasStringProperty({ foo }, 'foo')).toBe(true)
    )
    test.each(['', 'foo', 'bar'])(
      '({ foo: %o }, "foo", "bar") returns false',
      (foo: string) =>
        expect(hasStringProperty({ foo }, 'foo', 'bar')).toBe(false)
    )
    test.each([...objects.filter(o => typeof o !== 'string')])(
      '({ foo: "foo", bar: %o }, "foo", "bar") returns false',
      (bar: Exclude<unknown, string>) =>
        expect(hasStringProperty({ foo: 'foo', bar }, 'foo', 'bar')).toBe(false)
    )
    test.each([
      ['', ''],
      ['foo', 'bar'],
    ])(
      '({ foo: %o, bar: %o }, "foo", "bar") returns true',
      (foo: string, bar: string) =>
        expect(hasStringProperty({ foo, bar }, 'foo', 'bar')).toBe(true)
    )
    test.each([...objects.filter(o => typeof o !== 'string')])(
      '({ foo: "foo", bar: %o }, "foo") returns true',
      (bar: Exclude<unknown, string>) =>
        expect(hasStringProperty({ foo: 'foo', bar }, 'foo')).toBe(true)
    )
  })

  describe('hasIntegerProperty', () => {
    test.each([...objects])('(%o, "foo") returns false', (obj: unknown) =>
      expect(hasIntegerProperty(obj, 'foo')).toBe(false)
    )
    test.each([...objects, NaN, Infinity, -Infinity])(
      '({ foo: %o }, "foo") returns false',
      (foo: unknown) => expect(hasIntegerProperty({ foo }, 'foo')).toBe(false)
    )
    test.each([0, -0, 1, -1])(
      '({ foo: %o }, "foo") returns true',
      (foo: number) => expect(hasIntegerProperty({ foo }, 'foo')).toBe(true)
    )
    test.each([0, -0, 1, -1])(
      '({ foo: %o }, "foo", "bar") returns false',
      (foo: number) =>
        expect(hasIntegerProperty({ foo }, 'foo', 'bar')).toBe(false)
    )
    test.each([...objects, NaN, Infinity, -Infinity])(
      '({ foo: 1, bar: %o }, "foo", "bar") returns false',
      (bar: unknown) =>
        expect(hasIntegerProperty({ foo: 1, bar }, 'foo', 'bar')).toBe(false)
    )
    test.each([
      [0, -0],
      [1, -1],
    ])(
      '({ foo: %o, bar: %o }, "foo", "bar") returns true',
      (foo: unknown, bar: unknown) =>
        expect(hasIntegerProperty({ foo, bar }, 'foo', 'bar')).toBe(true)
    )
  })
})
