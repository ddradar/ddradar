// @vitest-environment node
import { publicUser } from '@ddradar/core/test/data'
import { describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v1/users/[id]/index.get'
import { createEvent } from '~~/server/test/utils'
import { tryFetchUser } from '~~/server/utils/auth'

vi.mock('~~/server/utils/auth')

describe('GET /api/v1/users/[id]', () => {
  test('returns 404 if tryFetchUser() returns null', async () => {
    // Arrange
    vi.mocked(tryFetchUser).mockResolvedValue(null)
    const event = createEvent({ id: 'not_exists_user' })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
  })

  test('returns 200 with JSON if tryFetchUser() returns user', async () => {
    // Arrange
    vi.mocked(tryFetchUser).mockResolvedValue(publicUser)
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
