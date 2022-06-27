import { publicUser } from '@ddradar/core/__tests__/data'
import { describe, expect, test, vi } from 'vitest'

import getCurrentUser from '~/server/api/v1/user.get'
import { getLoginUserInfo } from '~/server/auth'

import { createEvent } from '../test-util'

vi.mock('~/server/auth')

describe('GET /api/v1/user', () => {
  test('returns "404 Not Found" if getLoginUserInfo() returns null', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const result = await getCurrentUser(event)

    // Assert
    expect(event.res.statusCode).toBe(404)
    expect(result).toBe('User registration is not completed')
  })

  test('returns "200 OK" with JSON body if getLoginUserInfo() returns user', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)

    // Act
    const result = await getCurrentUser(event)

    // Assert
    expect(event.res.statusCode).toBe(200)
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
