import { fetchLoginUser, fetchUser } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { privateUser, publicUser } from '~/../core/test/data'
import { getLoginUserInfo, tryFetchUser } from '~/server/utils/auth'
import { createClientPrincipal, createEvent } from '~/test/test-utils-server'

vi.mock('@ddradar/db')

describe('server/utils/auth.ts', () => {
  describe('getLoginUserInfo', () => {
    beforeEach(() => {
      vi.mocked(getClientPrincipal).mockClear()
      vi.mocked(fetchLoginUser).mockClear()
    })

    test(`(getClientPrincipal: null) returns null`, async () => {
      // Arrange
      vi.mocked(getClientPrincipal).mockReturnValue(null)

      // Act
      const user = await getLoginUserInfo({} as any)

      // Assert
      expect(user).toBeNull()
      expect(vi.mocked(fetchLoginUser)).not.toBeCalled()
    })

    test(`(getClientPrincipal: <Unregistered User Token>) returns null`, async () => {
      // Arrange
      vi.mocked(getClientPrincipal).mockReturnValue(
        createClientPrincipal('id', 'loginId')
      )
      vi.mocked(fetchLoginUser).mockResolvedValue(null)

      // Act
      const user = await getLoginUserInfo({} as any)

      // Assert
      expect(user).toBeNull()
      expect(vi.mocked(fetchLoginUser)).toBeCalledWith('loginId')
    })

    test(`(getClientPrincipal: <Registered User Token>) returns UserSchema`, async () => {
      // Arrange
      vi.mocked(getClientPrincipal).mockReturnValue(
        createClientPrincipal(publicUser.id, publicUser.loginId)
      )
      vi.mocked(fetchLoginUser).mockResolvedValue(publicUser)

      // Act
      const user = await getLoginUserInfo({} as any)

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
      event.node.req.headers = {}
      event.context.params!.id = ''
      vi.mocked(fetchUser).mockClear()
    })

    test.each(['', '#user', 'ユーザー'])(
      '({ id: "%s" }) returns null',
      async id => {
        // Arrange
        event.context.params!.id = id

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
        event.context.params!.id = dbUser.id
        vi.mocked(getClientPrincipal).mockReturnValue({
          userId: loginId,
        } as any)
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
      event.context.params!.id = id
      vi.mocked(getClientPrincipal).mockReturnValue({ userId: loginId } as any)
      vi.mocked(fetchUser).mockResolvedValue(dbUser)

      // Act
      const user = await tryFetchUser(event)

      // Assert
      expect(user).toBeNull()
      expect(vi.mocked(fetchUser)).toBeCalledWith(id)
    })
  })
})
