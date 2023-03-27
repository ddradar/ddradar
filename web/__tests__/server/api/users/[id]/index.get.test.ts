import { publicUser } from '@ddradar/core/__tests__/data'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import getUserInfo from '~/server/api/v1/users/[id]/index.get'
import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')

describe('GET /api/v1/users/[id]', () => {
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
  })

  test('returns 404 if tryFetchUser() returns null', async () => {
    // Arrange
    vi.mocked(tryFetchUser).mockResolvedValue(null)
    const event = createEvent({ id: 'not_exists_user' })

    // Act
    const user = await getUserInfo(event)

    // Assert
    expect(user).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test('returns 200 with JSON if tryFetchUser() returns user', async () => {
    // Arrange
    vi.mocked(tryFetchUser).mockResolvedValue(publicUser)
    const event = createEvent({ id: publicUser.id })

    // Act
    const user = await getUserInfo(event)

    // Assert
    expect(user).toStrictEqual({
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      code: publicUser.code,
    })
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })
})
