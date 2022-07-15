import type { Database } from '@ddradar/core'
import { publicUser } from '@ddradar/core/__tests__/data'
import { fetchLoginUser, fetchUser, getContainer } from '@ddradar/db'
import { useBody } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import postUserInfo from '~/server/api/v1/user.post'
import { useClientPrincipal } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~/server/auth')
vi.mock('~/server/utils')

describe('POST /api/v1/user', () => {
  const user: Database.UserSchema = { ...publicUser }
  delete user.loginId
  const principal = {
    identityProvider: 'github',
    userDetails: user.id,
    userId: publicUser.loginId,
    userRoles: ['anonymous', 'authenticated'],
  } as const
  const mockedContainer = { items: { upsert: vi.fn() } }
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    mockedContainer.items.upsert.mockClear()
    vi.mocked(sendNullWithError).mockClear()
  })

  test('returns "401 Unauthenticated" if not logged in', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(useClientPrincipal).mockReturnValue(null)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 401)
  })

  test('returns "400 Bad Request" if body is not UserSchema', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(useClientPrincipal).mockReturnValue(principal)
    vi.mocked(useBody).mockResolvedValue(null)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'Invalid Body'
    )
  })

  test('returns "200 OK" with JSON body (Create)', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(user)
    vi.mocked(useClientPrincipal).mockReturnValue(principal)
    vi.mocked(fetchUser).mockResolvedValue(null)
    vi.mocked(fetchLoginUser).mockResolvedValue(null)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toStrictEqual(user)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.upsert).toBeCalledWith({
      ...user,
      loginId: '1',
    })
  })

  test.each([
    { name: 'AFRO' },
    { isPublic: true },
    { code: 20000000 },
    { password: 'changed' },
  ])(
    'returns "200 OK" with JSON body (Update) if changed %o',
    async (diff: Partial<Database.UserSchema>) => {
      // Arrange
      const event = createEvent()
      const body: Database.UserSchema = {
        id: user.id,
        name: user.name,
        area: user.area,
        isPublic: user.isPublic,
        ...diff,
      }
      vi.mocked(useBody).mockResolvedValue(body)
      vi.mocked(useClientPrincipal).mockReturnValue(principal)
      vi.mocked(fetchUser).mockResolvedValue(publicUser)
      vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

      // Act
      const result = await postUserInfo(event)

      // Assert
      expect(result).toStrictEqual(body)
      expect(vi.mocked(sendNullWithError)).not.toBeCalled()
      expect(mockedContainer.items.upsert).toBeCalledWith({
        ...body,
        loginId: publicUser.loginId,
      })
    }
  )

  test('returns "400 BadRequest" if changed loginId', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(user)
    vi.mocked(useClientPrincipal).mockReturnValue({ ...principal, userId: '3' })
    vi.mocked(fetchUser).mockResolvedValue(publicUser)
    vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'Duplicated Id'
    )
  })

  test('returns "400 BadRequest" if changed id', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue({ ...user, id: 'update' })
    vi.mocked(useClientPrincipal).mockReturnValue(principal)
    vi.mocked(fetchUser).mockResolvedValue(publicUser)
    vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'Duplicated Id'
    )
  })

  test('returns "200 OK" but does not update if changed area', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue({ ...user, area: 14 })
    vi.mocked(useClientPrincipal).mockReturnValue(principal)
    vi.mocked(fetchUser).mockResolvedValue(publicUser)
    vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toStrictEqual(user)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.upsert).toBeCalledWith(publicUser)
  })
})
