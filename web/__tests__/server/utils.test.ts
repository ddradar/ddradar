import { createError, sendError } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { sendNullWithError } from '~~/server/utils/http'

import { createEvent } from './test-util'

vi.mock('h3')

describe('server/utils.ts', () => {
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
