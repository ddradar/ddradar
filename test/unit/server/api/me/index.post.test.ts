// oxlint-disable typescript/unbound-method - to mock db methods
import { db } from '@nuxthub/db'
import { users } from '@nuxthub/db/schema'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import handler from '#server/api/me/index.post'
import { publicUser, sessionUser } from '~~/test/data/user'
import { createRequestEvent } from '~~/test/unit/util'

describe('POST /api/me', () => {
  const body: UserInfo = {
    id: 'new_user',
    name: 'New User',
    isPublic: true,
    area: 13,
    ddrCode: 12345678,
  }

  const returning = vi.fn<() => Promise<UserInfo[]>>()

  beforeAll(() =>
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn<() => void>(() => ({
        onConflictDoUpdate: vi.fn<() => void>(() => ({ returning })),
      })),
    } as never)
  )

  afterAll(() => vi.mocked(db.insert).mockReset())

  test('(body: <valid body>, session: <new user>) creates UserInfo on DB and updates session', async () => {
    // Arrange
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser },
    } as never)
    returning.mockResolvedValue([publicUser])
    const event = createRequestEvent(body)

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual(publicUser)
    expect(vi.mocked(db.insert)).toHaveBeenCalledWith(users)
    expect(setUserSession).toHaveBeenNthCalledWith(1, event, {
      user: {
        ...sessionUser,
        id: body.id,
        displayName: body.name,
      },
      lastAccessedAt: expect.any(Date) as Date,
    })
    expect(vi.mocked(clearUserCache)).toHaveBeenCalledWith(body.id)
  })

  test('(body: <other id body>, session: <existing user>) updates UserInfo and ignores body id', async () => {
    // Arrange
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser, id: body.id },
    } as never)
    returning.mockResolvedValue([publicUser])
    const event = createRequestEvent({ ...body, id: 'ignored_id' })

    // Act
    const result = await handler(event)

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

    const event = createRequestEvent(body)

    // Act & Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 409, statusMessage: 'Conflict' })
    )
    expect(setUserSession).not.toHaveBeenCalled()
    expect(vi.mocked(clearUserCache)).not.toHaveBeenCalled()
  })
})
