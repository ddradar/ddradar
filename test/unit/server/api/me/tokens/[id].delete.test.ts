import { kv } from '@nuxthub/kv'
import type { H3Event } from 'h3'
import { nanoid } from 'nanoid'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/me/tokens/[id].delete'
import { apiToken, sessionUser } from '~~/test/data/user'

describe('DELETE /api/me/tokens/[id]', () => {
  const user = { ...sessionUser, id: 'user1' }

  beforeEach(() => {
    vi.mocked(requireAuthenticatedUserFromSession).mockClear()
    vi.mocked(kv.get).mockClear()
    vi.mocked(kv.del).mockClear()
  })

  test.each(['', 'invalid-id'])(
    '(id: "%s") returns 400 when token id is invalid',
    async id => {
      // Arrange
      vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
      vi.mocked(kv.get).mockResolvedValue(apiToken)
      const event: Partial<H3Event> = {
        context: { params: { id } },
      }

      // Act - Assert
      await expect(handler(event as H3Event)).rejects.toThrow(
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
    const event: Partial<H3Event> = {
      context: { params: { id: tokenId } },
      node: { res: {} } as never,
    }

    // Act
    await handler(event as H3Event)

    // Assert
    expect(event.node?.res.statusCode).toBe(204)
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
    const event: Partial<H3Event> = {
      context: { params: { id: tokenId } },
      node: { res: {} } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrow(
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
