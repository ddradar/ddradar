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
      const userToBeCreated: UserSchema = {
        ...validUserInfo,
        id: '1',
        displayedId: validUserInfo.id,
        code: 10000000,
      }
      const userToBeUpdated: UserSchema = {
        id: '2',
        displayedId: 'exist_user',
        name: 'EMI',
        area: 0,
        isPublic: false,
      }

      beforeEach(async () => {
        await getContainer('Users').items.upsert<UserSchema>(userToBeUpdated)
      })

      test('returns "200 OK" with JSON body (Create)', async () => {
        // Arrange
        const body: UserInfo = {
          id: userToBeCreated.displayedId,
          name: userToBeCreated.name,
          area: userToBeCreated.area,
          code: userToBeCreated.code,
          isPublic: userToBeCreated.isPublic,
        }
        req.body = body
        mocked(getClientPrincipal).mockReturnValueOnce({
          identityProvider: 'github',
          userDetails: userToBeCreated.displayedId,
          userId: userToBeCreated.id,
          userRoles: ['anonymous', 'authenticated'],
        })

        // Act
        const result = await postUserInfo(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(body)
      })

      test.each([{ name: 'AFRO' }, { isPublic: true }, { code: 20000000 }])(
        'returns "200 OK" with JSON body (Update) if changed %p',
        async (diff: Partial<UserInfo>) => {
          // Arrange
          const body: UserInfo = {
            id: userToBeUpdated.displayedId,
            name: userToBeUpdated.name,
            area: userToBeUpdated.area,
            isPublic: userToBeUpdated.isPublic,
            ...diff,
          }
          req.body = body
          mocked(getClientPrincipal).mockReturnValueOnce({
            identityProvider: 'github',
            userDetails: userToBeUpdated.displayedId,
            userId: userToBeUpdated.id,
            userRoles: ['anonymous', 'authenticated'],
          })

          // Act
          const result = await postUserInfo(null, req)

          // Assert
          expect(result.status).toBe(200)
          expect(result.body).toStrictEqual(body)
        }
      )

      test.each([{ id: 'update' }, { area: 14 as const }])(
        'returns "200 OK" but does not update if changed %p',
        async (diff: Partial<UserInfo>) => {
          // Arrange
          const expected: UserInfo = {
            id: userToBeUpdated.displayedId,
            name: userToBeUpdated.name,
            area: userToBeUpdated.area,
            isPublic: userToBeUpdated.isPublic,
          }
          req.body = { ...expected, ...diff }
          mocked(getClientPrincipal).mockReturnValueOnce({
            identityProvider: 'github',
            userDetails: userToBeUpdated.displayedId,
            userId: userToBeUpdated.id,
            userRoles: ['anonymous', 'authenticated'],
          })

          // Act
          const result = await postUserInfo(null, req)

          // Assert
          expect(result.status).toBe(200)
          expect(result.body).toStrictEqual(expected)
        }
      )

      afterAll(async () => {
        await getContainer('Users')
          .item(userToBeCreated.id, userToBeCreated.area)
          .delete()
        await getContainer('Users')
          .item(userToBeUpdated.id, userToBeUpdated.area)
          .delete()
      })
    }
  )
})
