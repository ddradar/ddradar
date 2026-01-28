import { kv } from '@nuxthub/kv'
import type { H3Event } from 'h3'
import { nanoid } from 'nanoid'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import handler from '~~/server/api/me/tokens/[id].patch'
import { apiToken, sessionUser } from '~~/test/data/user'

describe('PATCH /api/me/tokens/:id', () => {
  const user = { ...sessionUser, id: 'user1' }
  const body: Pick<ApiToken, 'expiresAt'> = {
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  }

  beforeAll(() => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { token: { maxExpirationDays: 30 } },
    } as never)
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
  })
  beforeEach(() => {
    vi.mocked(kv.get).mockClear()
    vi.mocked(kv.set).mockClear()
  })
  afterAll(() => {
    vi.mocked(useRuntimeConfig).mockReset()
    vi.mocked(requireAuthenticatedUserFromSession).mockReset()
  })

  test.each(['', 'invalid-id'])(
    '(id: "%s") returns 400 when token id is invalid',
    async id => {
      // Arrange
      vi.mocked(kv.get).mockResolvedValue(apiToken)
      const event: Partial<H3Event> = {
        context: { params: { id } },
        node: { req: { body: JSON.stringify(body) } } as never,
      }

      // Act - Assert
      await expect(handler(event as H3Event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 400 })
      )
      expect(vi.mocked(kv.get)).not.toHaveBeenCalled()
      expect(vi.mocked(kv.set)).not.toHaveBeenCalled()
    }
  )

  test.each([
    { expiresAt: '' },
    { expiresAt: 'invalid-date' },
    {
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // past date
    },
    {
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now (beyond maxExpirationDays)
    },
  ])('(body: %o) returns 400 when expiresAt is invalid', async body => {
    // Arrange
    vi.mocked(kv.get).mockResolvedValue(apiToken)
    const event: Partial<H3Event> = {
      method: 'PATCH',
      context: { params: { id: nanoid() } },
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(kv.get)).not.toHaveBeenCalled()
    expect(vi.mocked(kv.set)).not.toHaveBeenCalled()
  })

  test('returns 404 when token does not exist', async () => {
    // Arrange
    vi.mocked(kv.get).mockResolvedValue(null)
    const id = nanoid()
    const event: Partial<H3Event> = {
      method: 'PATCH',
      context: { params: { id } },
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 404 })
    )
    expect(vi.mocked(kv.get)).toHaveBeenCalledWith(
      `user:${user.id}:token:${id}`
    )
    expect(vi.mocked(kv.set)).not.toHaveBeenCalled()
  })

  test('returns 200 with updated token', async () => {
    // Arrange
    vi.mocked(kv.get).mockResolvedValue(apiToken)
    const id = nanoid()
    const event: Partial<H3Event> = {
      method: 'PATCH',
      context: { params: { id } },
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act
    const result = await handler(event as H3Event)

    // Assert
    expect(result).toStrictEqual(
      expect.objectContaining({ id, expiresAt: body.expiresAt })
    )
    expect(vi.mocked(kv.get)).toHaveBeenCalledWith(
      `user:${user.id}:token:${id}`
    )
    expect(vi.mocked(kv.set)).toHaveBeenCalledWith(
      `user:${user.id}:token:${id}`,
      expect.objectContaining({ expiresAt: body.expiresAt })
    )
  })
})
