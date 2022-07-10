import { publicUser } from '@ddradar/core/__tests__/data'
import { createError, sendError } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import getCurrentUser from '~/server/api/v1/user.get'
import { addCORSHeader, getLoginUserInfo } from '~/server/auth'

import { createEvent } from '../test-util'

vi.mock('h3')
vi.mock('~/server/auth')

describe('GET /api/v1/user', () => {
  beforeEach(() => {
    vi.mocked(createError).mockClear()
    vi.mocked(sendError).mockClear()
    vi.mocked(addCORSHeader).mockClear()
  })

  test('returns "404 Not Found" if getLoginUserInfo() returns null', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const user = await getCurrentUser(event)

    // Assert
    expect(user).toBeNull()
    expect(vi.mocked(addCORSHeader)).toBeCalledWith(event, true)
    expect(vi.mocked(sendError)).toBeCalled()
    expect(vi.mocked(createError)).toBeCalledWith({
      statusCode: 404,
      message: 'User registration is not completed',
    })
  })

  test('returns "200 OK" with JSON body if getLoginUserInfo() returns user', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)

    // Act
    const result = await getCurrentUser(event)

    // Assert
    expect(vi.mocked(addCORSHeader)).toBeCalledWith(event, true)
    expect(vi.mocked(sendError)).not.toBeCalled()
    expect(result).toStrictEqual({
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      code: publicUser.code,
      isPublic: publicUser.isPublic,
      password: publicUser.password,
    })
  })
})
