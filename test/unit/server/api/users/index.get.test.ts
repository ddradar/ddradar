import { and, eq, or, sql } from 'drizzle-orm'
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

import handler from '~~/server/api/users/index.get'
import { privateUser, publicUser } from '~~/test/data/user'

describe('GET /api/users', () => {
  const findMany = vi.fn<typeof db.query.users.findMany>()
  const originalQuery = vi.mocked(db).query

  beforeAll(() => (vi.mocked(db).query = { users: { findMany } } as never))
  beforeEach(() => {
    findMany.mockClear()
    vi.mocked(getAuthenticatedUser).mockClear()
  })
  afterAll(() => (vi.mocked(db).query = originalQuery))

  test('select columns are fixed', async () => {
    // Arrange
    findMany.mockResolvedValue([publicUser] as never)
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
    const event = { path: '/api/users' } as unknown as H3Event

    // Act
    await handler(event)

    // Assert
    const arg = findMany.mock.calls[0]?.[0]
    expect(arg?.columns).toStrictEqual({
      id: true,
      name: true,
      isPublic: true,
      area: true,
      ddrCode: true,
    })
  })

  test.each([
    ['', [eq(users.isPublic, true)]],
    [
      'name=Test',
      [
        eq(users.isPublic, true),
        sql`${users.name} LIKE ${`%Test%`} ESCAPE ${'\\'}`,
      ],
    ],
    [
      'name=Test%25%5F',
      [
        eq(users.isPublic, true),
        sql`${users.name} LIKE ${`%Test\\%\\_%`} ESCAPE ${'\\'}`,
      ],
    ],
    ['area=13', [eq(users.isPublic, true), eq(users.area, 13)]],
    ['code=10000000', [eq(users.isPublic, true), eq(users.ddrCode, 10000000)]],
    [
      'name=Test&area=13&code=10000000',
      [
        eq(users.isPublic, true),
        sql`${users.name} LIKE ${`%Test%`} ESCAPE ${'\\'}`,
        eq(users.area, 13),
        eq(users.ddrCode, 10000000),
      ],
    ],
    // invalid parameters
    ['area=-1', [eq(users.isPublic, true)]],
    ['area=119', [eq(users.isPublic, true)]],
    ['code=9999999', [eq(users.isPublic, true)]],
    ['code=100000000', [eq(users.isPublic, true)]],
  ])(
    '(query: "%s") filters by expected conditions (without session)',
    async (query, conditions) => {
      // Arrange
      findMany.mockResolvedValue([publicUser] as never)
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
      const pathSuffix = query ? `?${query}` : ''
      const event = { path: `/api/users${pathSuffix}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toEqual([publicUser])
      expect(findMany).toHaveBeenCalledTimes(1)
      const arg = findMany.mock.calls[0]?.[0]
      expect(arg?.where).toStrictEqual(and(...conditions))
    }
  )

  test.each([
    ['', [or(eq(users.isPublic, true), eq(users.id, privateUser.id))]],
    [
      'name=Test',
      [
        or(eq(users.isPublic, true), eq(users.id, privateUser.id)),
        sql`${users.name} LIKE ${`%Test%`} ESCAPE ${'\\'}`,
      ],
    ],
  ])(
    '(query: "%s") filters by expected conditions (with session)',
    async (query, conditions) => {
      // Arrange
      findMany.mockResolvedValue([publicUser, privateUser] as never)
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        id: privateUser.id,
        roles: [],
      })
      const pathSuffix = query ? `?${query}` : ''
      const event = { path: `/api/users${pathSuffix}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toEqual([publicUser, privateUser])
      expect(findMany).toHaveBeenCalledTimes(1)
      const arg = findMany.mock.calls[0]?.[0]
      expect(arg?.where).toStrictEqual(and(...conditions))
    }
  )
})
