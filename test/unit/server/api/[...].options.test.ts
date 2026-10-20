import { describe, expect, test } from 'vitest'

import handler from '#server/api/[...].options'
import { createRequestEvent } from '~~/test/unit/util'

describe('OPTIONS /api/**', () => {
  test('returns 204 No Content', () => {
    // Arrange
    const event = createRequestEvent(null)

    // Act
    handler(event)

    // Assert
    expect(event.res.status).toBe(204)
  })
})
