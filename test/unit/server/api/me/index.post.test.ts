import type { H3Event } from 'h3'
import { users } from 'hub:db:schema'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import handler from '~~/server/api/me/index.post'
import { publicUser, sessionUser } from '~~/test/data/user'

describe('POST /api/me', () => {
  const body: UserInfo = {
    id: 'new_user',
    name: 'New User',
    isPublic: true,
    area: 13,
    ddrCode: 12345678,
  }

  const returning = vi.fn()

  beforeAll(() =>
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => ({ returning })),
      })),
    } as never)
  )
  beforeEach(() => {
    vi.mocked(db.insert).mockClear()
    vi.mocked(requireUserSession).mockClear()
    vi.mocked(clearUserCache).mockClear()
    vi.mocked(setUserSession).mockClear()
  })
  afterAll(() => vi.mocked(db.insert).mockReset())

  test('(body: <valid body>, session: <new user>) creates UserInfo on DB and updates session', async () => {
    // Arrange
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser },
    } as never)
    returning.mockResolvedValue([publicUser])
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
    expect(result).toStrictEqual(publicUser)
    expect(vi.mocked(db.insert)).toHaveBeenCalledWith(users)
    expect(setUserSession).toHaveBeenNthCalledWith(1, event, {
      user: {
        ...sessionUser,
        id: body.id,
        displayName: body.name,
      },
      lastAccessedAt: expect.any(Date),
    })
    expect(vi.mocked(clearUserCache)).toHaveBeenCalledWith(body.id)
  })

  test('(body: <other id body>, session: <existing user>) updates UserInfo and ignores body id', async () => {
    // Arrange
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser, id: body.id },
    } as never)
    returning.mockResolvedValue([publicUser])
    const event: Partial<H3Event> = {
      node: {
        req: {
          body: JSON.stringify({ ...body, id: 'ignored_id' }),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
      method: 'POST',
    }

    // Act
    const result = await handler(event as H3Event)

    // Assert
    expect(result).toStrictEqual(publicUser)
    expect(vi.mocked(db.insert)).toHaveBeenCalledWith(users)
    // setUserSession and clearUserCache should use body.id, not ignored_id
    const sessionArg = vi.mocked(setUserSession).mock.calls[0]?.[1]
    expect(sessionArg?.user).toMatchObject({
      id: body.id,
      displayName: body.name,
    })
    expect(vi.mocked(clearUserCache)).toHaveBeenCalledWith(body.id)
  })

  test('throws 409 when returning rows are not exactly one', async () => {
    // Arrange
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser, id: undefined },
    } as never)
    returning.mockResolvedValue([])

    const event: Partial<H3Event> = {
      method: 'POST',
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      } as never,
    }

    // Act & Assert
    await expect(handler(event as H3Event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 409, statusMessage: 'Conflict' })
    )
    expect(setUserSession).not.toHaveBeenCalled()
    expect(vi.mocked(clearUserCache)).not.toHaveBeenCalled()
  })
})
