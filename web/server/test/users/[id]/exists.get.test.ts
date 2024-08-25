// @vitest-environment node
import { publicUser } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/users/[id]/exists.get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/users/[id]/exists', () => {
  const dbUser = { id: publicUser.id }
  beforeEach(() => {
    vi.mocked(hasRole).mockClear()
    vi.mocked(getUserRepository).mockClear()
  })

  test(`<anonymous user> returns 401`, async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(false)
    const event = createEvent({ id: dbUser.id })

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 401 })
    )
    expect(vi.mocked(getUserRepository)).not.toHaveBeenCalled()
  })

  const invalidId = 'ユーザー'
  test(`(id: "${invalidId}") returns 400`, async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(true)
    const event = createEvent({ id: invalidId })

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getUserRepository)).not.toHaveBeenCalled()
  })

  test('(id: "not_exists_user") returns 200 with { exists: false }', async () => {
    // Arrange
    const id = 'not_exists_user'
    vi.mocked(hasRole).mockReturnValue(true)
    const exists = vi.fn().mockResolvedValue(false)
    vi.mocked(getUserRepository).mockReturnValue({
      exists,
    } as unknown as ReturnType<typeof getUserRepository>)
    const event = createEvent({ id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual({ id, exists: false })
    expect(vi.mocked(getUserRepository)).toHaveBeenCalled()
    expect(exists).toHaveBeenCalledWith(id)
  })

  test(`(id: "${dbUser.id}") returns 200 with { exists: true }`, async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(true)
    const exists = vi.fn().mockResolvedValue(true)
    vi.mocked(getUserRepository).mockReturnValue({
      exists,
    } as unknown as ReturnType<typeof getUserRepository>)
    const event = createEvent({ id: dbUser.id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual({ id: dbUser.id, exists: true })
    expect(vi.mocked(getUserRepository)).toHaveBeenCalled()
    expect(exists).toHaveBeenCalledWith(dbUser.id)
  })
})
