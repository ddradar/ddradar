import { privateUser, publicUser } from '@ddradar/core/__tests__/data'

import { canReadUserData } from '../auth'
import getUserInfo from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}', () => {
  const req = { headers: {} }

  test('returns "404 Not Found" if canReadUserData() returns false', async () => {
    // Arrange
    jest.mocked(canReadUserData).mockReturnValue(false)

    // Act
    const result = await getUserInfo(null, req, [])

    // Assert
    expect(result.status).toBe(404)
  })

  test.each([
    [
      publicUser,
      {
        id: publicUser.id,
        name: publicUser.name,
        area: publicUser.area,
        code: publicUser.code,
      },
    ],
    [
      privateUser,
      {
        id: privateUser.id,
        name: privateUser.name,
        area: privateUser.area,
      },
    ],
  ])(`%p returns "200 OK" with %p`, async (user, expected) => {
    // Arrange
    jest.mocked(canReadUserData).mockReturnValue(true)

    // Act
    const result = await getUserInfo(null, req, [user])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual(expected)
  })
})
