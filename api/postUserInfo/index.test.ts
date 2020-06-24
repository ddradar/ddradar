import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer } from '../cosmos'
import type { UserSchema } from '../db'
import postUserInfo, { UserInfo } from '.'

jest.mock('../auth')

const validUserInfo: UserInfo = {
  id: 'new_user',
  name: 'New User',
  area: 13,
  isPublic: true,
}

describe('POST /api/v1/user', () => {
  let req: Pick<HttpRequest, 'body' | 'headers'>

  beforeEach(() => {
    req = { body: {}, headers: {} }
  })

  test('returns "401 Unauthenticated" if not logged in', async () => {
    // Arrange - Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.status).toBe(401)
  })

  test.each([
    undefined,
    null,
    true,
    1,
    'foo',
    {},
    { ...validUserInfo, id: 1 },
    { ...validUserInfo, id: '#foo' },
    { ...validUserInfo, area: 'Tokyo' },
    { ...validUserInfo, area: -1 },
    { ...validUserInfo, code: '1000-0000' },
    { ...validUserInfo, code: -1 },
    { ...validUserInfo, code: 100000000 },
    { ...validUserInfo, isPublic: undefined },
    { id: 'new_user', name: 'New User', area: 13 },
  ])('returns "400 Bad Request" if body is %p', async (body: unknown) => {
    // Arrange
    req.body = body
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userDetails: 'login_user',
      userId: '1',
      userRoles: ['anonymous', 'authenticated'],
    })

    // Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.status).toBe(400)
    expect(result.body).toBe('Body is not UserSchema')
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const userToBeCreated: UserInfo = {
        ...validUserInfo,
        code: 10000000,
      }
      const userToBeUpdated: UserInfo = {
        id: 'exist_user',
        name: 'EMI',
        area: 0,
        isPublic: false,
      }

      beforeAll(async () => {
        await getContainer('Users').items.create<UserSchema>({
          ...userToBeUpdated,
          id: '2',
          displayedId: userToBeUpdated.id,
        })
      })

      test('returns "200 OK" with JSON body (Create)', async () => {
        // Arrange
        req.body = userToBeCreated
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: userToBeCreated.id,
          userId: '1',
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await postUserInfo(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(userToBeCreated)
      })

      test('returns "200 OK" with JSON body (Update)', async () => {
        // Arrange
        const body = { ...userToBeUpdated, name: 'AFRO' }
        req.body = body
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: userToBeUpdated.id,
          userId: '2',
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await postUserInfo(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(body)
      })

      afterAll(async () => {
        await getContainer('Users').item('1', userToBeCreated.area).delete()
        await getContainer('Users').item('2', userToBeUpdated.area).delete()
      })
    }
  )
})
