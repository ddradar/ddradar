import { and, eq, or } from 'drizzle-orm'
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

import handler from '~~/server/api/users/[id]/index.get'
import { privateUser, publicUser, sessionUser } from '~~/test/data/user'

describe('GET /api/users/[id]', () => {
  const findFirst = vi.fn<typeof db.query.users.findFirst>()
  const originalQuery = vi.mocked(db).query

  beforeAll(() => (vi.mocked(db).query = { users: { findFirst } } as never))
  beforeEach(() => {
    findFirst.mockClear()
    vi.mocked(getUserSession).mockClear()
  })
  afterAll(() => (vi.mocked(db).query = originalQuery))

  test.each(['', 'ab', 'a'.repeat(33), 'invalid user!'])(
    '(id: "%s") throws 400',
    async id => {
      // Arrange
      vi.mocked(getUserSession).mockResolvedValue({ user: undefined } as never)
      const event = { context: { params: { id } } } as unknown as H3Event

      // Act & Assert
      await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 })
      expect(findFirst).not.toHaveBeenCalled()
    }
  )

  test(`(id: "${publicUser.id}") returns publicUser (found in DB)`, async () => {
    // Arrange
    findFirst.mockResolvedValue(publicUser as never)
    vi.mocked(getUserSession).mockResolvedValue({ user: undefined } as never)
    const event = {
      context: { params: { id: publicUser.id } },
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(publicUser)
    expect(findFirst).toHaveBeenCalledTimes(1)
    const arg = findFirst.mock.calls[0]?.[0]
    expect(arg?.where).toStrictEqual(
      or(
        and(eq(schema.users.id, publicUser.id), eq(schema.users.isPublic, true))
      )
    )
  })

  test(`(id: "${privateUser.id}") throws 404 (not found in DB or user is not owner)`, async () => {
    // Arrange
    findFirst.mockResolvedValue(undefined)
    vi.mocked(getUserSession).mockResolvedValue({ user: undefined } as never)
    const event = {
      context: { params: { id: privateUser.id } },
    } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
    expect(findFirst).toHaveBeenCalledTimes(1)
    const arg = findFirst.mock.calls[0]?.[0]
    expect(arg?.where).toStrictEqual(
      or(
        and(
          eq(schema.users.id, privateUser.id),
          eq(schema.users.isPublic, true)
        )
      )
    )
  })

  test(`(id: "${privateUser.id}") returns privateUser (user is owner)`, async () => {
    // Arrange
    findFirst.mockResolvedValue(privateUser as never)
    vi.mocked(getUserSession).mockResolvedValue({ user: sessionUser } as never)
    const event = {
      context: { params: { id: privateUser.id } },
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(privateUser)
    expect(findFirst).toHaveBeenCalledTimes(1)
    const arg = findFirst.mock.calls[0]?.[0]
    expect(arg?.where).toStrictEqual(
      or(
        and(
          eq(schema.users.id, privateUser.id),
          eq(schema.users.isPublic, true)
        ),
        and(
          eq(schema.users.id, privateUser.id),
          eq(schema.users.provider, sessionUser.provider),
          eq(schema.users.providerId, sessionUser.providerId)
        )
      )
    )
  })
})
