import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import type { UserSchema } from '../db/users'
import getCurrentUser from '.'

jest.mock('../auth')

describe('GET /api/v1/user', () => {
  const req = { headers: {} }

  test('returns "404 Not Found" if getLoginUserInfo() returns null', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const result = await getCurrentUser(null, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "200 OK" with JSON body if getLoginUserInfo() returns user', async () => {
    // Arrange
    const user: UserSchema = {
      id: 'public_user',
      loginId: '1',
      name: 'Public User',
      area: 13,
      code: 10000000,
      isPublic: true,
    }
    mocked(getLoginUserInfo).mockResolvedValueOnce(user)

    // Act
    const result = await getCurrentUser(null, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({
      id: user.id,
      name: user.name,
      area: user.area,
      code: user.code,
      isPublic: user.isPublic,
    })
  })
})
