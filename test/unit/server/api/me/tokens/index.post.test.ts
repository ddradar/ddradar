import { kv } from '@nuxthub/kv'
import type { H3Event } from 'h3'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import handler from '~~/server/api/me/tokens/index.post'
import { sessionUser } from '~~/test/data/user'

describe('POST /api/me/tokens', () => {
  const user = { ...sessionUser, id: 'user1' }
  const body: Pick<ApiToken, 'expiresAt' | 'name'> = {
    name: 'My API Token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  }

  beforeAll(() =>
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { token: { maxExpirationDays: 30, maxCreationPerUser: 10 } },
    } as never)
  )
  beforeEach(() => {
    vi.mocked(requireAuthenticatedUserFromSession).mockClear()
    vi.mocked(useRuntimeConfig).mockClear()
    vi.mocked(kv.get).mockClear()
    vi.mocked(kv.has).mockClear()
    vi.mocked(kv.keys).mockClear()
  })
  afterAll(() => vi.mocked(useRuntimeConfig).mockReset())

  test.each([
    {},
    { ...body, name: '' },
    { ...body, name: 'A'.repeat(101) }, // too long
    { ...body, expiresAt: '' },
    { ...body, expiresAt: 'invalid-date' },
    {
      ...body,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // past date
    },
    {
      ...body,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now (beyond maxExpirationDays)
    },
  ])('(body: %o) returns 400 when body is invalid', async body => {
    // Arrange
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
    vi.mocked(kv.keys).mockResolvedValue([])
    vi.mocked(kv.has).mockResolvedValue(false)
    const event: Partial<H3Event> = {
      method: 'POST',
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(kv.keys)).not.toHaveBeenCalled()
    expect(vi.mocked(kv.has)).not.toHaveBeenCalled()
    expect(vi.mocked(kv.set)).not.toHaveBeenCalled()
  })

  test('returns 400 when token count exceeds maxCreationPerUser', async () => {
    // Arrange
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
    vi.mocked(kv.keys).mockResolvedValue(Array(10).fill('')) // maxCreationPerUser reached
    vi.mocked(kv.has).mockResolvedValue(false)
    const event: Partial<H3Event> = {
      method: 'POST',
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(kv.keys)).toHaveBeenCalled()
    expect(vi.mocked(kv.has)).not.toHaveBeenCalled()
    expect(vi.mocked(kv.set)).not.toHaveBeenCalled()
  })

  test('returns 500 when hash collision occurs 5 times', async () => {
    // Arrange
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
    vi.mocked(kv.keys).mockResolvedValue([])
    vi.mocked(kv.has).mockResolvedValue(true) // always indicate collision
    const event: Partial<H3Event> = {
      method: 'POST',
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act - Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 500 })
    )
    expect(vi.mocked(kv.keys)).toHaveBeenCalled()
    expect(vi.mocked(kv.has)).toHaveBeenCalledTimes(5)
    expect(vi.mocked(kv.set)).not.toHaveBeenCalled()
  })

  test('returns 200 with token', async () => {
    // Arrange
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
    vi.mocked(kv.keys).mockResolvedValue([])
    vi.mocked(kv.has).mockResolvedValue(false)
    const event: Partial<H3Event> = {
      method: 'POST',
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
    expect(result).toHaveProperty('token')
    expect(vi.mocked(kv.keys)).toHaveBeenCalled()
    expect(vi.mocked(kv.has)).toHaveBeenCalled()
    expect(vi.mocked(kv.set)).toHaveBeenCalledWith(
      expect.stringMatching(/^token:[A-Za-z0-9\-_]{64}$/),
      { userId: user.id, tokenId: expect.any(String) }
    )
    expect(vi.mocked(kv.set)).toHaveBeenCalledWith(
      expect.stringMatching(/^user:user1:token:[A-Za-z0-9\-_]{21}$/),
      expect.objectContaining({
        name: body.name,
        hashedToken: expect.any(String),
        createdAt: expect.any(String),
        expiresAt: body.expiresAt,
      })
    )
  })
})
