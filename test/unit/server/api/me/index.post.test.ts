import { and, eq } from 'drizzle-orm'
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

import handler from '~~/server/api/me/index.post'
import { publicUser, sessionUser } from '~~/test/data/user'

// Body used in requests
const body = {
  id: 'new_user',
  name: 'New User',
  isPublic: true,
  area: 13,
  ddrCode: 12345678,
}

describe('POST /api/me', () => {
  const originalInsert = vi.mocked(db).insert

  // drizzle insert builder chain mocks
  const insert = vi.fn<typeof db.insert>()
  const values = vi.fn<ReturnType<typeof db.insert>['values']>()
  const onConflictDoUpdate =
    vi.fn<
      ReturnType<ReturnType<typeof db.insert>['values']>['onConflictDoUpdate']
    >()
  const returning =
    vi.fn<
      ReturnType<
        ReturnType<ReturnType<typeof db.insert>['values']>['onConflictDoUpdate']
      >['returning']
    >()

  beforeAll(() => {
    // chain: insert(schema.users).values(...).onConflictDoUpdate(...).returning(...)
    vi.mocked(db).insert = insert as never
    insert.mockImplementation(() => ({ values }) as never)
    values.mockImplementation(() => ({ onConflictDoUpdate }) as never)
    onConflictDoUpdate.mockImplementation(() => ({ returning }) as never)
  })
  beforeEach(() => {
    insert.mockClear()
    values.mockClear()
    onConflictDoUpdate.mockClear()
    returning.mockClear()
    vi.mocked(requireUserSession).mockClear()
    vi.mocked(setUserSession).mockClear()
  })
  afterAll(() => (vi.mocked(db).insert = originalInsert))

  test('creates/updates user (no existing id) and updates session', async () => {
    // Arrange
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser, id: undefined },
    } as never)
    returning.mockResolvedValue([publicUser] as never)
    const event = {
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      },
      method: 'POST',
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(publicUser)

    // insert chain assertions
    expect(insert).toHaveBeenCalledWith(schema.users)

    const valuesArg = values.mock.calls[0]?.[0]
    expect(valuesArg).toMatchObject({
      id: body.id, // falls back to body.id when session user.id is undefined
      name: body.name,
      isPublic: body.isPublic,
      area: body.area,
      ddrCode: body.ddrCode,
      provider: sessionUser.provider,
      providerId: sessionUser.providerId,
    })

    const conflictArg = onConflictDoUpdate.mock.calls[0]?.[0]
    expect(conflictArg?.target).toStrictEqual([schema.users.id])
    expect(conflictArg?.targetWhere).toStrictEqual(
      and(
        eq(schema.users.provider, sessionUser.provider),
        eq(schema.users.providerId, sessionUser.providerId)
      )
    )
    expect(conflictArg?.set).toStrictEqual({
      name: body.name,
      isPublic: body.isPublic,
      area: body.area,
      ddrCode: body.ddrCode,
    })

    expect(returning).toHaveBeenCalledWith({
      id: schema.users.id,
      name: schema.users.name,
      isPublic: schema.users.isPublic,
      area: schema.users.area,
      ddrCode: schema.users.ddrCode,
    })

    expect(setUserSession).toHaveBeenCalledTimes(1)
    const sessionArg = vi.mocked(setUserSession).mock.calls[0]?.[1]
    expect(sessionArg?.user).toMatchObject({
      id: body.id,
      displayName: body.name,
    })
  })

  test('uses existing session id when present', async () => {
    // When session has id, values.id uses the session id
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser, id: 'auth_user' },
    } as never)
    returning.mockResolvedValue([publicUser] as never)

    const event = {
      node: {
        req: {
          body: JSON.stringify({ ...body, id: 'different_id' }),
          headers: { 'content-type': 'application/json' },
        },
      },
      method: 'POST',
    } as unknown as H3Event

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toEqual(publicUser)

    const valuesArg = values.mock.calls[0]?.[0] as unknown as Record<
      string,
      unknown
    >
    expect(valuesArg.id).toBe('auth_user') // prefer session id

    // setUserSession should use body.id
    const sessionArg = vi.mocked(setUserSession).mock.calls[0]?.[1]
    expect(sessionArg?.user).toMatchObject({
      id: 'different_id',
      displayName: body.name,
    })
  })

  test('throws 500 when returning rows are not exactly one', async () => {
    // Arrange
    vi.mocked(requireUserSession).mockResolvedValue({
      user: { ...sessionUser, id: undefined },
    } as never)
    returning.mockResolvedValue([] as never)

    const event = {
      node: {
        req: {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        },
      },
      method: 'POST',
    } as unknown as H3Event

    // Act & Assert
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to upsert user',
    })
    expect(setUserSession).not.toHaveBeenCalled()
  })
})
