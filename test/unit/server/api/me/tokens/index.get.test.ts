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

import handler from '~~/server/api/me/tokens/index.get'
import { apiToken, sessionUser } from '~~/test/data/user'

describe('GET /api/me/tokens', () => {
  const user = { ...sessionUser, id: 'user1' }

  beforeAll(() => {
    vi.mocked(requireAuthenticatedUserFromSession).mockResolvedValue(user)
  })
  beforeEach(() => {
    vi.mocked(kv.get).mockClear()
    vi.mocked(kv.keys).mockClear()
  })
  afterAll(() => {
    vi.mocked(requireAuthenticatedUserFromSession).mockReset()
  })

  test('returns 200 with list of tokens', async () => {
    // Arrange
    vi.mocked(kv.keys).mockResolvedValue([
      `user:${user.id}:token:token1`,
      `user:${user.id}:token:token2`,
      `user:${user.id}:token:token3`, // this one will be null (removed before getting)
    ])
    vi.mocked(kv.get)
      .mockResolvedValue(null)
      .mockResolvedValueOnce({ ...apiToken, name: 'Token 1' })
      .mockResolvedValueOnce({ ...apiToken, name: 'Token 2' })

    // Act
    const result = await handler({} as H3Event)

    // Assert
    expect(result).toStrictEqual([
      {
        id: 'token1',
        name: 'Token 1',
        createdAt: apiToken.createdAt,
        expiresAt: apiToken.expiresAt,
      },
      {
        id: 'token2',
        name: 'Token 2',
        createdAt: apiToken.createdAt,
        expiresAt: apiToken.expiresAt,
      },
    ])
    expect(vi.mocked(kv.keys)).toHaveBeenCalledWith(`user:${user.id}:token`)
    expect(vi.mocked(kv.get)).toHaveBeenCalledWith(
      `user:${user.id}:token:token1`
    )
    expect(vi.mocked(kv.get)).toHaveBeenCalledWith(
      `user:${user.id}:token:token2`
    )
    expect(vi.mocked(kv.get)).toHaveBeenCalledWith(
      `user:${user.id}:token:token3`
    )
  })
})
