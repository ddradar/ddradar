import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import type { UserSchema } from '../db'
import getUserInfo from '.'

jest.mock('../auth')

describe('GET /api/v1/users', () => {
  let context: Pick<Context, 'bindingData'>
  const req = { headers: {} }

  beforeEach(() => {
    context = { bindingData: {} }
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getUserInfo(context, req)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each(['', '\\', 'あ'])('/%s returns "404 Not Found"', async id => {
    // Arrange
    context.bindingData.id = id

    // Act
    const result = await getUserInfo(context, req)

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toBe('Please pass a id like "/api/v1/users/:id"')
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const publicUser: UserSchema = {
        id: '1',
        displayedId: 'public_user',
        name: 'Public User',
        area: 13,
        code: 10000000,
        isPublic: true,
      } as const
      const privateUser: UserSchema = {
        id: '2',
        displayedId: 'private_user',
        name: 'Private User',
        area: 0,
        isPublic: false,
      } as const

      beforeAll(async () => {
        await getContainer('Users').items.create(publicUser)
        await getContainer('Users').items.create(privateUser)
      })

      test('/phantom_user returns "404 Not Found"', async () => {
        // Arrange
        const id = 'phantom_user'
        context.bindingData.id = id

        // Act
        const result = await getUserInfo(context, req)

        // Assert
        expect(result.status).toBe(404)
        expect(result.body).toBe(`Not found user that id: "${id}"`)
      })

      test(`/${publicUser.displayedId} returns "200 OK" with JSON body`, async () => {
        // Arrange
        const id = publicUser.displayedId
        context.bindingData.id = id

        // Act
        const result = await getUserInfo(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({
          id: publicUser.displayedId,
          name: publicUser.name,
          area: publicUser.area,
          code: publicUser.code,
        })
      })

      test(`/${privateUser.displayedId} returns "404 Not Found" if no authenticated`, async () => {
        // Arrange
        const id = privateUser.displayedId
        context.bindingData.id = id

        // Act
        const result = await getUserInfo(context, req)

        // Assert
        expect(result.status).toBe(404)
        expect(result.body).toBe(`Not found user that id: "${id}"`)
      })

      test(`/${privateUser.displayedId} returns "404 Not Found" if logged in as otherUser`, async () => {
        // Arrange
        const id = privateUser.displayedId
        context.bindingData.id = id
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: publicUser.displayedId,
          userId: publicUser.id,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await getUserInfo(context, req)

        // Assert
        expect(result.status).toBe(404)
        expect(result.body).toBe(`Not found user that id: "${id}"`)
      })

      test(`/${privateUser.displayedId} returns "200 OK" with JSON body if logged in as privateUser`, async () => {
        // Arrange
        const id = privateUser.displayedId
        context.bindingData.id = id
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: privateUser.displayedId,
          userId: privateUser.id,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await getUserInfo(context, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual({
          id: privateUser.displayedId,
          name: privateUser.name,
          area: privateUser.area,
        })
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
