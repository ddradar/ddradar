// @vitest-environment node
import { publicUser } from '@ddradar/core/test/data'
import { describe, expect, test, vi } from 'vitest'

import getCurrentUser from '~~/server/api/v1/user/index.get'
import { createEvent } from '~~/server/test/utils'
import { getLoginUserInfo } from '~~/server/utils/auth'

vi.mock('~~/server/utils/auth')

describe('GET /api/v1/user', () => {
  test('returns 200 if getLoginUserInfo() returns null', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const user = await getCurrentUser(event)

    // Assert
    expect(user).toBeNull()
  })

  test('returns 200 with JSON if getLoginUserInfo() returns user', async () => {
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
  })
})
