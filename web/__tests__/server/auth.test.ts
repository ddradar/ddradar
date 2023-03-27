import { privateUser, publicUser } from '@ddradar/core/__tests__/data'
import { fetchLoginUser, fetchUser } from '@ddradar/db'
import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  getLoginUserInfo,
  tryFetchUser,
  useClientPrincipal,
} from '~~/server/utils/auth'

import { createClientPrincipal, createEvent } from './test-util'

vi.mock('@ddradar/db')

const toBase64 = (obj: unknown) => {
  const jsonString = JSON.stringify(obj)
  const utf8buffer = Buffer.from(jsonString)
  return utf8buffer.toString('base64')
}
const authHeader = 'x-ms-client-principal'

describe('server/auth.ts', () => {
  describe('useClientPrincipal', () => {
    const event: Pick<H3Event, 'req'> = createEvent()
    beforeEach(() => {
      event.req.headers = {}
    })

    test.each(['', 'foo', undefined, []])(
      `({ ${authHeader} : %o }) returns null`,
      header => {
        // Arrange
        event.req.headers[authHeader] = header

        // Act - Assert
        expect(useClientPrincipal(event)).toBe(null)
      }
    )

    test.each([
      {
        identityProvider: 'github',
        userDetails: 'github_user',
        userId: 'abcdef',
        userRoles: ['anonymous', 'authenticated'],
      },
      {
        identityProvider: 'twitter',
        userDetails: 'twitter_admin_user',
        userId: '123456',
        userRoles: ['anonymous', 'authenticated', 'administrator'],
      },
    ])(`({ ${authHeader} : toBase64(%o) }) returns same object`, expected => {
      // Arrange
      const header = toBase64(expected)
      event.req.headers[authHeader] = header

      // Act - Assert
      expect(useClientPrincipal(event)).toStrictEqual(expected)
    })
  })

  describe('getLoginUserInfo', () => {
    const event: Pick<H3Event, 'req'> = createEvent()
    beforeEach(() => {
      event.req.headers = {}
      vi.mocked(fetchLoginUser).mockClear()
    })

    test(`({ ${authHeader} : '' }) returns null`, async () => {
      // Arrange
      event.req.headers[authHeader] = ''

      // Act
      const user = await getLoginUserInfo(event)

      // Assert
      expect(user).toBeNull()
      expect(vi.mocked(fetchLoginUser)).not.toBeCalled()
    })

    test(`({ ${authHeader} : <Unregistered User Token> }) returns null`, async () => {
      // Arrange
      event.req.headers[authHeader] = toBase64(
        createClientPrincipal('id', 'loginId')
      )
      vi.mocked(fetchLoginUser).mockResolvedValue(null)

      // Act
      const user = await getLoginUserInfo(event)

      // Assert
      expect(user).toBeNull()
      expect(vi.mocked(fetchLoginUser)).toBeCalledWith('loginId')
    })

    test(`({ ${authHeader} : <Registered User Token> }) returns UserSchema`, async () => {
      // Arrange
      event.req.headers[authHeader] = toBase64(
        createClientPrincipal(publicUser.id, publicUser.loginId)
      )
      vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

      // Act
      const user = await getLoginUserInfo(event)

      // Assert
      expect(user).toBe(publicUser)
      expect(vi.mocked(fetchLoginUser)).toBeCalledWith(publicUser.loginId)
    })
  })

  describe('tryFetchUser', () => {
    const event: Parameters<typeof tryFetchUser>[0] = createEvent({
      id: '',
    })
    beforeEach(() => {
      event.req.headers = {}
      event.context.params.id = ''
      vi.mocked(fetchUser).mockClear()
    })

    test.each(['', '#user', 'ユーザー'])(
      '({ id: "%s" }) returns null',
      async id => {
        // Arrange
        event.context.params.id = id

        // Act
        const user = await tryFetchUser(event)

        // Assert
        expect(user).toBeNull()
        expect(vi.mocked(fetchUser)).not.toBeCalled()
      }
    )

    test.each([
      [publicUser, null],
      [publicUser, 'foo'],
      [privateUser, privateUser.loginId],
    ])(
      `({ id: %o, header: "%s" }) returns UserSchema`,
      async (dbUser, loginId) => {
        // Arrange
        event.context.params.id = dbUser.id
        event.req.headers[authHeader] = toBase64({ userId: loginId })
        vi.mocked(fetchUser).mockResolvedValue(dbUser)

        // Act
        const user = await tryFetchUser(event)

        // Assert
        expect(user).toStrictEqual(dbUser)
        expect(vi.mocked(fetchUser)).toBeCalledWith(dbUser.id)
      }
    )

    test.each([
      [null, null],
      [privateUser, null],
      [privateUser, 'foo'],
    ])(`({ id: %o, header: "%s" }) returns null`, async (dbUser, loginId) => {
      // Arrange
      const id = dbUser?.id ?? 'foo'
      event.context.params.id = id
      event.req.headers[authHeader] = toBase64({ userId: loginId })
      vi.mocked(fetchUser).mockResolvedValue(dbUser)

      // Act
      const user = await tryFetchUser(event)

      // Assert
      expect(user).toBeNull()
      expect(vi.mocked(fetchUser)).toBeCalledWith(id)
    })
  })
})
