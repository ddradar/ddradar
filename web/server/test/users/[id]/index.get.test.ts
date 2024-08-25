// @vitest-environment node
import { publicUser } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/users/[id]/index.get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/users/[id]', () => {
  beforeEach(() => {
    vi.mocked(getUser).mockClear()
  })

  test('returns 404 when getUser() throws error', async () => {
    // Arrange
    vi.mocked(getUser).mockRejectedValue({ statusCode: 404 })
    const event = createEvent({ id: 'not_exists_user' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 404 })
    )
  })

  test('returns 200 with JSON when getUser() returns user', async () => {
    // Arrange
    vi.mocked(getUser).mockResolvedValue(publicUser)
    const event = createEvent({ id: publicUser.id })

    // Act
    const user = await handler(event)

    // Assert
    expect(user).toStrictEqual({
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      code: publicUser.code,
    })
  })
})
