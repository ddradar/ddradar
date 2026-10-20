import { kv } from '@nuxthub/kv'
import { nanoid } from 'nanoid'
import { describe, expect, test, vi } from 'vitest'

import handler from '#server/api/me/tokens/[id].delete'
import { apiToken, sessionUser } from '~~/test/data/user'
import { createRequestEvent } from '~~/test/unit/util'

describe('DELETE /api/me/tokens/[id]', () => {
  const user = { ...sessionUser, id: 'user1' }

  test.each(['', 'invalid-id'])(
    '(id: "%s") returns 400 when token id is invalid',
    async id => {
      // Arrange
      vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
      vi.mocked(kv.get).mockResolvedValue(apiToken)
      const event = createRequestEvent(null, { id })

      // Act - Assert
      await expect(handler(event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 400 })
      )
      expect(vi.mocked(kv.get)).not.toHaveBeenCalled()
      expect(vi.mocked(kv.del)).not.toHaveBeenCalled()
    }
  )

  test('returns 204 when successfully delete', async () => {
    // Arrange
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
    vi.mocked(kv.get).mockResolvedValue(apiToken)
    const tokenId = nanoid()
    const event = createRequestEvent(null, { id: tokenId })

    // Act
    await handler(event)

    // Assert
    expect(event.res.status).toBe(204)
    expect(vi.mocked(kv.get)).toHaveBeenCalledWith(
      `user:${user.id}:token:${tokenId}`
    )
    expect(vi.mocked(kv.del)).toHaveBeenCalledWith(
      `token:${apiToken.hashedToken}`
    )
    expect(vi.mocked(kv.del)).toHaveBeenCalledWith(
      `user:${user.id}:token:${tokenId}`
    )
  })

  test('returns 404 when token does not exist', async () => {
    // Arrange
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
    vi.mocked(kv.get).mockResolvedValue(null)
    const tokenId = nanoid()
    const event = createRequestEvent(null, { id: tokenId })

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({
        statusCode: 404,
        statusMessage: 'Token not found',
      })
    )
    expect(vi.mocked(kv.get)).toHaveBeenCalledWith(
      `user:${user.id}:token:${tokenId}`
    )
    expect(vi.mocked(kv.del)).not.toHaveBeenCalled()
  })
})
