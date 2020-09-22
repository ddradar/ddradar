import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal } from '../auth'
import getUserInfo from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const publicUser = {
    id: 'public_user',
    loginId: '1',
    name: 'Public User',
    area: 13,
    code: 10000000,
    isPublic: true,
  } as const
  const privateUser = {
    id: 'private_user',
    loginId: '2',
    name: 'Private User',
    area: 0,
    isPublic: false,
  } as const
  const req = { headers: {} }
  beforeEach(() => (context.bindingData = {}))

  test('returns "404 Not Found" if documents is empty', async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getUserInfo(context, req, [])

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toBe('Not found user that id: "foo"')
  })

  test('returns "200 OK" with JSON body if documents has 1 public user', async () => {
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

  test('returns "404 Not Found" if documents has 1 private user', async () => {
    // Arrange
    context.bindingData.id = privateUser.id

    // Act
    const result = await getUserInfo(context, req, [privateUser])

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toBe(`Not found user that id: "${privateUser.id}"`)
  })

  test('returns "200 OK" with JSON body if documents has 1 login user', async () => {
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
