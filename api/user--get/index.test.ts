import { publicUser } from '@ddradar/core/__tests__/data'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
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
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)

    // Act
    const result = await getCurrentUser(null, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      code: publicUser.code,
      isPublic: publicUser.isPublic,
      password: publicUser.password,
    })
  })
})
