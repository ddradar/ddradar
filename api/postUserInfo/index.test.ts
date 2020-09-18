import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { getClientPrincipal } from '../auth'
import { getConnectionString, getContainer } from '../db'
import postUserInfo, { UserInfo } from '.'

jest.mock('../auth')

const validUserInfo = {
  id: 'new_user',
  name: 'New User',
  area: 13,
  isPublic: true,
} as const

describe('POST /api/v1/user', () => {
  let req: Pick<HttpRequest, 'body' | 'headers'>

  beforeEach(() => {
    req = { body: {}, headers: {} }
  })

  test('returns "401 Unauthenticated" if not logged in', async () => {
    // Arrange - Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(401)
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
    expect(result.httpResponse.status).toBe(400)
    expect(result.httpResponse.body).toBe('Body is not UserSchema')
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const userToBeCreated = {
        ...validUserInfo,
        loginId: '1',
        code: 10000000,
      } as const
      const userToBeUpdated = {
        id: 'exist_user',
        loginId: '2',
        name: 'EMI',
        area: 0,
        isPublic: false,
      } as const

      beforeAll(async () => {
        await getContainer('Users').items.create(userToBeUpdated)
      })

      test('returns "200 OK" with JSON body (Create)', async () => {
        // Arrange
        const body: UserInfo = {
          id: userToBeCreated.id,
          name: userToBeCreated.name,
          area: userToBeCreated.area,
          code: userToBeCreated.code,
          isPublic: userToBeCreated.isPublic,
        }
        req.body = body
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: userToBeCreated.id,
          userId: userToBeCreated.loginId,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await postUserInfo(null, req)

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual(body)
        expect(result.document).toStrictEqual(userToBeCreated)
      })

      test.each([{ name: 'AFRO' }, { isPublic: true }, { code: 20000000 }])(
        'returns "200 OK" with JSON body (Update) if changed %p',
        async (diff: Partial<UserInfo>) => {
          // Arrange
          const body: UserInfo = {
            id: userToBeUpdated.id,
            name: userToBeUpdated.name,
            area: userToBeUpdated.area,
            isPublic: userToBeUpdated.isPublic,
            ...diff,
          }
          req.body = body
          mocked(getClientPrincipal).mockReturnValueOnce({
            identityProvider: 'github',
            userDetails: userToBeUpdated.id,
            userId: userToBeUpdated.loginId,
            userRoles: ['anonymous', 'authenticated'],
          })

          // Act
          const result = await postUserInfo(null, req)

          // Assert
          expect(result.httpResponse.status).toBe(200)
          expect(result.httpResponse.body).toStrictEqual(body)
          expect(result.document).toStrictEqual({
            ...body,
            loginId: userToBeUpdated.loginId,
          })
        }
      )

      test('returns "400 BadRequest" if changed loginId', async () => {
        // Arrange
        req.body = {
          id: userToBeUpdated.id,
          name: userToBeUpdated.name,
          area: userToBeUpdated.area,
          isPublic: userToBeUpdated.isPublic,
        }
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: 'other_user',
          userId: '3',
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await postUserInfo(null, req)

        // Assert
        expect(result.httpResponse.status).toBe(400)
      })

      test('returns "400 BadRequest" if changed id', async () => {
        // Arrange
        req.body = {
          id: 'update',
          name: userToBeUpdated.name,
          area: userToBeUpdated.area,
          isPublic: userToBeUpdated.isPublic,
        }
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: userToBeUpdated.id,
          userId: userToBeUpdated.loginId,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await postUserInfo(null, req)

        // Assert
        expect(result.httpResponse.status).toBe(400)
      })

      test('returns "200 OK" but does not update if changed area', async () => {
        // Arrange
        const expected: UserInfo = {
          id: userToBeUpdated.id,
          name: userToBeUpdated.name,
          area: userToBeUpdated.area,
          isPublic: userToBeUpdated.isPublic,
        }
        req.body = { ...expected, area: 14 }
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: userToBeUpdated.id,
          userId: userToBeUpdated.loginId,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await postUserInfo(null, req)

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual(expected)
        expect(result.document).toStrictEqual(userToBeUpdated)
      })

      afterAll(async () => {
        await getContainer('Users')
          .item(userToBeUpdated.id, userToBeUpdated.id)
          .delete()
      })
    }
  )
})
