import { db } from '@nuxthub/db'
import { users } from '@nuxthub/db/schema'
import { and, eq, isNull, or, sql } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/users/index.get'
import { privateUser, publicUser } from '~~/test/data/user'

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.mocked(db.query.users.findMany).mockClear()
    vi.mocked(getAuthenticatedUser).mockClear()
  })

  describe.each([
    ['', []],
    ['name=Test', [sql`${users.name} LIKE ${`%Test%`} ESCAPE ${'\\'}`]],
    [
      'name=Test%25%5F',
      [sql`${users.name} LIKE ${`%Test\\%\\_%`} ESCAPE ${'\\'}`],
    ],
    ['area=13', [eq(users.area, 13)]],
    ['code=10000000', [eq(users.ddrCode, 10000000)]],
    [
      'name=Test&area=13&code=10000000',
      [
        sql`${users.name} LIKE ${`%Test%`} ESCAPE ${'\\'}`,
        eq(users.area, 13),
        eq(users.ddrCode, 10000000),
      ],
    ],
    // invalid parameters
    ['area=-1', []],
    ['area=119', []],
    ['code=9999999', []],
    ['code=100000000', []],
  ])('(query: "%s") filters by expected conditions', (query, conditions) => {
    test('without authentication', async () => {
      // Arrange
      vi.mocked(db.query.users.findMany).mockResolvedValue([
        publicUser,
      ] as never)
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null)
      const pathSuffix = query ? `?${query}` : ''
      const event = { path: `/api/users${pathSuffix}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual([publicUser])
      expect(vi.mocked(db.query.users.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: and(
            isNull(users.deletedAt),
            eq(users.isPublic, true),
            ...conditions
          ),
        })
      )
    })

    test('with authentication', async () => {
      // Arrange
      vi.mocked(db.query.users.findMany).mockResolvedValue([
        publicUser,
        privateUser,
      ] as never)
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        id: privateUser.id,
        roles: [],
      })
      const pathSuffix = query ? `?${query}` : ''
      const event = { path: `/api/users${pathSuffix}` } as unknown as H3Event

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual([publicUser, privateUser])
      expect(vi.mocked(db.query.users.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: and(
            isNull(users.deletedAt),
            or(eq(users.isPublic, true), eq(users.id, privateUser.id)),
            ...conditions
          ),
        })
      )
    })
  })
})
