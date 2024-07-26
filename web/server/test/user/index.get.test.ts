// @vitest-environment node
import { publicUser } from '@ddradar/core/test/data'
import { describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/user/index.get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/user', () => {
  test('throws error when getLoginUserInfo() throws error', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockRejectedValue({ statusCode: 401 })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
  })

  test('returns 200 with JSON', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValue({ ...publicUser })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual(publicUser)
  })
})
