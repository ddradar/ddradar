// @vitest-environment node
import type { UserSchema } from '@ddradar/core'
import { fetchLoginUser, fetchUser, getContainer } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { publicUser } from '~/../core/test/data'
import postUserInfo from '~~/server/api/v1/user/index.post'
import { sendNullWithError } from '~~/server/utils/http'
import { createClientPrincipal, createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/http')

describe('POST /api/v1/user', () => {
  const user: UserSchema = { ...publicUser }
  delete user.loginId
  const principal = createClientPrincipal(user.id, publicUser.loginId)
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

  test('returns 401 if not logged in', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getClientPrincipal).mockReturnValue(null)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 401)
  })

  test('returns 400 if body is not UserSchema', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, null)
    vi.mocked(getClientPrincipal).mockReturnValue(principal)

    // Act - Assert
    await expect(postUserInfo(event)).rejects.toThrowError()
  })

  test('returns 200 with JSON (Create)', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, user)
    vi.mocked(getClientPrincipal).mockReturnValue(principal)
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
      isAdmin: false,
    })
  })

  test.each([
    { name: 'AFRO' },
    { isPublic: true },
    { code: 20000000 },
    { password: 'changed' },
  ])(
    'returns "200 OK" with JSON body (Update) if changed %o',
    async (diff: Partial<UserSchema>) => {
      // Arrange
      const body: UserSchema = {
        id: user.id,
        name: user.name,
        area: user.area,
        isPublic: user.isPublic,
        ...diff,
      }
      const event = createEvent(undefined, undefined, body)
      vi.mocked(getClientPrincipal).mockReturnValue(principal)
      vi.mocked(fetchUser).mockResolvedValue({ ...publicUser, isAdmin: true })
      vi.mocked(fetchLoginUser).mockResolvedValue({
        ...publicUser,
        isAdmin: true,
      })

      // Act
      const result = await postUserInfo(event)

      // Assert
      expect(result).toStrictEqual(body)
      expect(vi.mocked(sendNullWithError)).not.toBeCalled()
      expect(mockedContainer.items.upsert).toBeCalledWith({
        ...body,
        loginId: publicUser.loginId,
        isAdmin: true,
      })
    }
  )

  test('returns 400 if changed loginId', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, user)
    vi.mocked(getClientPrincipal).mockReturnValue({ ...principal, userId: '3' })
    vi.mocked(fetchUser).mockResolvedValue(publicUser)
    vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toBeNull()
    const message = 'Duplicated Id'
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 400, message)
  })

  test('returns 400 if changed id', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, { ...user, id: 'update' })
    vi.mocked(getClientPrincipal).mockReturnValue(principal)
    vi.mocked(fetchUser).mockResolvedValue(publicUser)
    vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toBeNull()
    const message = 'Duplicated Id'
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 400, message)
  })

  test('returns 200 but does not update if changed area', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, { ...user, area: 14 })
    vi.mocked(getClientPrincipal).mockReturnValue(principal)
    vi.mocked(fetchUser).mockResolvedValue(publicUser)
    vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

    // Act
    const result = await postUserInfo(event)

    // Assert
    expect(result).toStrictEqual(user)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(mockedContainer.items.upsert).toBeCalledWith({
      ...publicUser,
      isAdmin: false,
    })
  })
})
