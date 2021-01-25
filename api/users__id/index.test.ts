import type { Context } from '@azure/functions'
import { privateUser, publicUser } from '@ddradar/core/__tests__/data'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal } from '../auth'
import getUserInfo from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const req = { headers: {} }
  beforeEach(() => (context.bindingData = {}))

  test('/foo returns "404 Not Found"', async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getUserInfo(context, req, [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${publicUser.id} returns "200 OK" with JSON body`, async () => {
    // Arrange
    context.bindingData.id = publicUser.id

    // Act
    const result = await getUserInfo(context, req, [publicUser])

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
    // Arrange
    context.bindingData.id = privateUser.id

    // Act
    const result = await getUserInfo(context, req, [privateUser])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id} returns "200 OK" with JSON body if logged in`, async () => {
    // Arrange
    context.bindingData.id = privateUser.id
    mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: privateUser.id,
      userId: privateUser.loginId,
      userRoles: ['anonymous', 'authenticated'],
    })

    // Act
    const result = await getUserInfo(context, req, [privateUser])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({
      id: privateUser.id,
      name: privateUser.name,
      area: privateUser.area,
    })
  })
})
