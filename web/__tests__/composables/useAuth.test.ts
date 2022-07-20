import { publicUser } from '@ddradar/core/__tests__/data'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { useRequestHeaders } from '#app'
import { createClientPrincipal } from '~/__tests__/server/test-util'
import useAuth from '~/composables/useAuth'
import type { CurrentUserInfo } from '~/server/api/v1/user/index.get'
import type { ClientPrincipal } from '~/server/auth'

const $fetchMock = vi.fn()
vi.stubGlobal('$fetch', $fetchMock)
vi.mock('#app')

describe('composables/useAuth.ts', () => {
  /**
   * Mock `$fetch` function
   * @param clientPrincipal response of GET `/.auth/me`
   * @param user response of GET `/api/v1/user`
   */
  const mockFetch = (
    clientPrincipal: ClientPrincipal | null,
    user: CurrentUserInfo | null
  ) =>
    $fetchMock.mockImplementation(
      (url, options) =>
        Promise.resolve(
          url === '/.auth/me'
            ? { clientPrincipal }
            : options?.method === 'post'
            ? publicUser
            : user
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any
    )

  beforeAll(() => {
    vi.mocked(useRequestHeaders).mockReturnValue({ AuthToken: 'token' })
  })
  beforeEach(() => {
    $fetchMock.mockClear()
    vi.mocked(useRequestHeaders).mockClear()
  })

  test.each([
    [null, null, undefined, false, false],
    [
      createClientPrincipal(publicUser.id, publicUser.loginId, false),
      publicUser,
      publicUser.name,
      true,
      false,
    ],
    [
      createClientPrincipal(publicUser.id, publicUser.loginId, true),
      publicUser,
      publicUser.name,
      true,
      true,
    ],
  ])(
    '{ clientPrincipal: %o, user: %o } returns { name: "%s", isLoggedIn: %o, isAdmin: %o }',
    async (clientPrincipal, user, name, isLoggedIn, isAdmin) => {
      // Arrange
      mockFetch(clientPrincipal, user)

      // Act
      const authComposition = await useAuth()

      // Assert
      expect($fetchMock).toBeCalledTimes(2)
      expect(authComposition.auth.value).toStrictEqual(clientPrincipal)
      expect(authComposition.user.value).toStrictEqual(user)
      expect(authComposition.name.value).toBe(name)
      expect(authComposition.isLoggedIn.value).toBe(isLoggedIn)
      expect(authComposition.isAdmin.value).toBe(isAdmin)
    }
  )

  test('refresh() calls $fetch() again', async () => {
    // Arrange
    mockFetch(null, null)

    // Act
    const { refresh } = await useAuth()
    await refresh()

    // Assert
    expect($fetchMock).toBeCalledTimes(4)
  })

  test('updateUser(user) updates user.value', async () => {
    // Arrange
    mockFetch(null, null)

    // Act
    const { user, updateUser } = await useAuth()
    await updateUser(publicUser)

    // Assert
    expect($fetchMock).toBeCalledTimes(3)
    expect(user.value).toStrictEqual(publicUser)
  })
})
