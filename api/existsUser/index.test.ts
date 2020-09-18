import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer, UserSchema } from '../db'
import existsUser from '.'

jest.mock('../auth')

describe('GET /api/v1/users/exists', () => {
  let context: Pick<Context, 'bindingData'>
  const req = { headers: {} }

  beforeEach(() => {
    context = { bindingData: {} }
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userDetails: 'new_user',
      userId: '3',
      userRoles: ['anonymous', 'authenticated'],
    })
  })

  test('returns "401 Unauthorized" if not logged in', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await existsUser(context, req)

    // Assert
    expect(result.status).toBe(401)
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await existsUser(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each(['', '\\', 'あ'])('/%s returns "404 Not Found"', async id => {
    // Arrange
    context.bindingData.id = id

    // Act
    const result = await existsUser(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const publicUser: UserSchema = {
        id: 'public_user',
        loginId: '1',
        name: 'Public User',
        area: 13,
        code: 10000000,
        isPublic: true,
      } as const
      const privateUser: UserSchema = {
        id: 'private_user',
        loginId: '2',
        name: 'Private User',
        area: 0,
        isPublic: false,
      } as const

      beforeAll(async () => {
        await getContainer('Users').items.create(publicUser)
        await getContainer('Users').items.create(privateUser)
      })

      test('/phantom_user returns "200 OK" with not exists JSON body', async () => {
        // Arrange
        const id = 'phantom_user'
        context.bindingData.id = id

        // Act
        const result = await existsUser(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({ id, exists: false })
      })

      test(`/${publicUser.id} returns "200 OK" with exists JSON body`, async () => {
        // Arrange
        const id = publicUser.id
        context.bindingData.id = id

        // Act
        const result = await existsUser(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({ id, exists: true })
      })

      test(`/${privateUser.id} returns "200 OK" with exists JSON body`, async () => {
        // Arrange
        const id = privateUser.id
        context.bindingData.id = id

        // Act
        const result = await existsUser(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({ id, exists: true })
      })

      afterAll(async () => {
        await getContainer('Users').item(publicUser.id, publicUser.id).delete()
        await getContainer('Users')
          .item(privateUser.id, privateUser.id)
          .delete()
      })
    }
  )
})
