import { createError, sendError } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  getQueryInteger,
  getQueryString,
  sendNullWithError,
} from '~/server/utils'

import { createEvent } from './test-util'

vi.mock('h3')

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

  describe('sendNullWithError', () => {
    beforeEach(() => {
      vi.mocked(createError).mockClear()
      vi.mocked(sendError).mockClear()
    })

    test.each([
      [404, undefined],
      [400, 'Invalid Body'],
    ])('(event, %i, "%s") calls sendError()', (statusCode, message) => {
      // Arrange
      const event = createEvent()

      // Act
      const result = sendNullWithError(event, statusCode, message)

      // Assert
      expect(result).toBeNull()
      expect(vi.mocked(sendError)).toBeCalled()
      expect(vi.mocked(createError)).toBeCalledWith({ statusCode, message })
    })
  })
})
