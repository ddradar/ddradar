import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/users/[id]/index.get'
import { privateUser, publicUser } from '~~/test/data/user'

describe('GET /api/users/[id]', () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedUser).mockClear()
    vi.mocked(getCachedUser).mockClear()
  })

  test.each(['', 'ab', 'a'.repeat(33), 'invalid user!'])(
    '(id: "%s") throws 400',
    async id => {
      // Arrange
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
      const event = { context: { params: { id } } } as unknown as H3Event

      // Act & Assert
      await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 })
      expect(vi.mocked(getCachedUser)).not.toHaveBeenCalled()
    }
  )

  test(`(id: "${publicUser.id}") returns publicUser (found in DB or cache)`, async () => {
    // Arrange
    vi.mocked(getCachedUser).mockResolvedValue(publicUser)
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
    const event = {
      context: { params: { id: publicUser.id } },
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(publicUser)
    expect(vi.mocked(getCachedUser)).toHaveBeenNthCalledWith(
      1,
      event,
      publicUser.id
    )
  })

  test(`(id: "not_exists_user_id") throws 404 (user not found)`, async () => {
    // Arrange
    vi.mocked(getCachedUser).mockResolvedValue(undefined)
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
    const event = {
      context: { params: { id: 'not_exists_user_id' } },
    } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
    expect(vi.mocked(getCachedUser)).toHaveBeenNthCalledWith(
      1,
      event,
      'not_exists_user_id'
    )
  })

  test(`(id: "${privateUser.id}") throws 404 (user is private and not owner)`, async () => {
    // Arrange
    vi.mocked(getCachedUser).mockResolvedValue(privateUser)
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
    const event = {
      context: { params: { id: privateUser.id } },
    } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
    expect(vi.mocked(getCachedUser)).toHaveBeenNthCalledWith(
      1,
      event,
      privateUser.id
    )
  })

  test(`(id: "${privateUser.id}") returns privateUser (user is private but owner)`, async () => {
    // Arrange
    vi.mocked(getCachedUser).mockResolvedValue(privateUser)
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: privateUser.id,
      roles: [],
    })
    const event = {
      context: { params: { id: privateUser.id } },
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(privateUser)
    expect(vi.mocked(getCachedUser)).toHaveBeenNthCalledWith(
      1,
      event,
      privateUser.id
    )
  })
})
