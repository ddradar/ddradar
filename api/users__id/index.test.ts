import { privateUser, publicUser } from '@ddradar/core/__tests__/data'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal } from '../auth'
import getUserInfo from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}', () => {
  const req = { headers: {} }

  test('/not_exist_user returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getUserInfo(null, req, [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${publicUser.id} returns "200 OK" with JSON body`, async () => {
    // Arrange - Act
    const result = await getUserInfo(null, req, [publicUser])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({
      id: publicUser.id,
      name: publicUser.name,
      area: publicUser.area,
      code: publicUser.code,
    })
  })

  test(`/${privateUser.id} returns "404 Not Found"`, async () => {
    // Arrange - Act
    const result = await getUserInfo(null, req, [privateUser])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id} returns "200 OK" with JSON body if logged in`, async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: privateUser.id,
      userId: privateUser.loginId,
      userRoles: ['anonymous', 'authenticated'],
    })

    // Act
    const result = await getUserInfo(null, req, [privateUser])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({
      id: privateUser.id,
      name: privateUser.name,
      area: privateUser.area,
    })
  })
})
