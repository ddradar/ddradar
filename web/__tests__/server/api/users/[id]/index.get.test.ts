import { publicUser } from '@ddradar/core/__tests__/data'
import { fetchOne } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import getUserInfo from '~/server/api/v1/users/[id]/index.get'
import { useClientPrincipal } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('~/server/auth')
vi.mock('~/server/utils')

describe('GET /api/v1/users', () => {
  const dbUser = {
    id: publicUser.id,
    name: publicUser.name,
    area: publicUser.area,
    code: publicUser.code,
  }
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchOne).mockClear()
  })

  const invalidId = 'ユーザー'
  test(`/${invalidId} returns "404 Not Found"`, async () => {
    // Arrange
    vi.mocked(useClientPrincipal).mockReturnValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(dbUser as any)
    const event = createEvent({ id: invalidId })

    // Act
    const user = await getUserInfo(event)

    // Assert
    expect(user).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test(`/not_exists_user returns "404 Not Found"`, async () => {
    // Arrange
    vi.mocked(useClientPrincipal).mockReturnValue(null)
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id: 'not_exists_user' })

    // Act
    const user = await getUserInfo(event)

    // Assert
    expect(user).toBeNull()
    expect(vi.mocked(fetchOne).mock.lastCall?.[3]).toStrictEqual({
      condition: '(c.isPublic OR c.loginId = @)',
      value: null,
    })
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test(`${dbUser.id} returns "200 OK" with JSON body`, async () => {
    // Arrange
    vi.mocked(useClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userDetails: dbUser.id,
      userId: publicUser.loginId,
      userRoles: ['anonymous', 'authenticated'],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(dbUser as any)
    const event = createEvent({ id: dbUser.id })

    // Act
    const user = await getUserInfo(event)

    // Assert
    expect(user).toBe(dbUser)
    expect(vi.mocked(fetchOne).mock.lastCall?.[3]).toStrictEqual({
      condition: '(c.isPublic OR c.loginId = @)',
      value: publicUser.loginId,
    })
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })
})
