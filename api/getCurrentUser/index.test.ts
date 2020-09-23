import { mocked } from 'ts-jest/utils'

import { getClientPrincipal } from '../auth'
import { fetchLoginUser, UserSchema } from '../db/users'
import getCurrentUser from '.'

jest.mock('../auth')
jest.mock('../db/users')

describe('GET /api/v1/user', () => {
  const req = { headers: {} }
  beforeAll(() =>
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userDetails: 'new_user',
      userId: '3',
      userRoles: ['anonymous', 'authenticated'],
    })
  )

  test('returns "404 Not Found" if fetchLoginUser() returns null', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await getCurrentUser(null, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test('returns "200 OK" with JSON body if fetchLoginUser() returns user', async () => {
    // Arrange
    const user: UserSchema = {
      id: 'public_user',
      loginId: '1',
      name: 'Public User',
      area: 13,
      code: 10000000,
      isPublic: true,
    }
    mocked(fetchLoginUser).mockResolvedValueOnce(user)

    // Act
    const result = await getCurrentUser(null, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({
      id: user.id,
      name: user.name,
      area: user.area,
      code: user.code,
    })
  })
})
