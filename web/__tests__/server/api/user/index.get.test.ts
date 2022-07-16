import { publicUser } from '@ddradar/core/__tests__/data'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import getCurrentUser from '~/server/api/v1/user/index.get'
import { getLoginUserInfo } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

vi.mock('~/server/auth')
vi.mock('~/server/utils')

describe('GET /api/v1/user', () => {
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
  })

  test('returns "404 Not Found" if getLoginUserInfo() returns null', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const user = await getCurrentUser(event)

    // Assert
    const message = 'User registration is not completed'
    expect(user).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404, message)
  })

  test('returns "200 OK" with JSON body if getLoginUserInfo() returns user', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValueOnce({ ...publicUser })

    // Act
    const result = await getCurrentUser(event)

    // Assert
    expect(result).toStrictEqual({
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      code: publicUser.code,
      isPublic: publicUser.isPublic,
      password: publicUser.password,
    })
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })
})
