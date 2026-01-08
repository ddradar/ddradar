import type { H3Event } from 'h3'
import { describe, expect, test } from 'vitest'

import handler from '~~/server/api/[...].options'

describe('OPTIONS /api/**', () => {
  test('returns 204 No Content', () => {
    // Arrange
    const event: Partial<H3Event> = {
      method: 'OPTIONS',
      node: { res: {} } as never,
    }

    // Act
    handler(event as H3Event)

    // Assert
    expect(event.node?.res.statusCode).toBe(204)
  })
})
