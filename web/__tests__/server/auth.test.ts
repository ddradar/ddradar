import { privateUser, publicUser } from '@ddradar/core/__tests__/data'
import { fetchLoginUser } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'
import { appendHeader } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  addCORSHeader,
  allowedOrigin,
  canReadUserData,
  getLoginUserInfo,
  useClientPrincipal,
} from '~/server/auth'

import { createEvent } from './test-util'

vi.mock('@ddradar/db')
vi.mock('h3')

const toBase64 = (obj: unknown) => {
  const jsonString = JSON.stringify(obj)
  const utf8buffer = Buffer.from(jsonString)
  return utf8buffer.toString('base64')
}
const authHeader = 'x-ms-client-principal'

describe('server/auth.ts', () => {
  describe('useClientPrincipal', () => {
    const event: Pick<CompatibilityEvent, 'req'> = createEvent()
    beforeEach(() => {
      event.req.headers = {}
    })

    test.each(['', 'foo'])(`({ ${authHeader} : %s }) returns null`, header => {
      // Arrange
      event.req.headers[authHeader] = header

      // Act - Assert
      expect(useClientPrincipal(event)).toBe(null)
    })

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
    ])(`({ ${authHeader} : toBase64(%p) }) returns same object`, expected => {
      // Arrange
      const header = toBase64(expected)
      event.req.headers[authHeader] = header

      // Act - Assert
      expect(useClientPrincipal(event)).toStrictEqual(expected)
    })
  })

  describe('getLoginUserInfo', () => {
    test('(null) returns null', async () => {
      // Arrange - Act
      const user = await getLoginUserInfo(null)

      // Assert
      expect(user).toBeNull()
    })

    test('({ Unregistered user }) returns null', async () => {
      // Arrange
      vi.mocked(fetchLoginUser).mockResolvedValueOnce(null)

      // Act
      const user = await getLoginUserInfo({ userId: 'unregistered_user' })

      // Assert
      expect(user).toBeNull()
    })

    test('({ Registered user }) returns UserSchema', async () => {
      // Arrange
      vi.mocked(fetchLoginUser).mockResolvedValueOnce(publicUser)

      // Act
      const user = await getLoginUserInfo({ userId: 'registered_user' })

      // Assert
      expect(user).toBe(publicUser)
    })
  })

  describe('canReadUserData', () => {
    const event: Pick<CompatibilityEvent, 'req'> = createEvent()
    beforeEach(() => {
      event.req.headers = {}
    })

    test('({not login}, undefined) returns false', () =>
      expect(canReadUserData(event, undefined)).toBe(false))
    test('({not login}, publicUser) returns true', () =>
      expect(canReadUserData(event, publicUser)).toBe(true))
    test('({not login}, privateUser) returns false', () =>
      expect(canReadUserData(event, privateUser)).toBe(false))
    test('({login as privateUser}, privateUser) returns true', () => {
      // Arrange
      event.req.headers[authHeader] = toBase64({ userId: privateUser.loginId })

      // Act - Assert
      expect(canReadUserData(event, privateUser)).toBe(true)
    })
  })

  describe('addCORSHeader', () => {
    const event = createEvent()
    beforeEach(() => {
      vi.mocked(appendHeader).mockClear()
    })

    test.each([
      [
        undefined,
        [
          { name: 'Access-Control-Allow-Origin', value: '*' },
          { name: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
        ],
      ],
      [
        false,
        [
          { name: 'Access-Control-Allow-Origin', value: '*' },
          { name: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
        ],
      ],
      [
        true,
        [
          { name: 'Access-Control-Allow-Origin', value: allowedOrigin },
          { name: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
          { name: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      ],
    ])(
      '(event, %o) calls appendHeader(event) with %o',
      (needsCredentials, headers) => {
        // Arrange - Act
        addCORSHeader(event, needsCredentials)

        // Assert
        expect(vi.mocked(appendHeader)).toBeCalledTimes(headers.length)
        for (const header of headers) {
          expect(vi.mocked(appendHeader)).toBeCalledWith(
            event,
            header.name,
            header.value
          )
        }
      }
    )
  })
})
