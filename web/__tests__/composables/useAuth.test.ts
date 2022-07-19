import { publicUser } from '@ddradar/core/__tests__/data'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { useFetch, useRequestHeaders, useState } from '#app'
import { createClientPrincipal } from '~/__tests__/server/test-util'
import useAuth from '~/composables/useAuth'
import type { CurrentUserInfo } from '~/server/api/v1/user/index.get'
import type { ClientPrincipal } from '~/server/auth'

const $fetchMock = vi.fn()
vi.stubGlobal('$fetch', $fetchMock)
vi.mock('#app')

describe('composables/useAuth.ts', () => {
  const refreshMock = vi.fn()
  /**
   * Mock `useFetch()` function
   * @param clientPrincipal response of GET `/.auth/me`
   * @param user response of GET `/api/v1/user`
   */
  const mockUseFetch = (
    clientPrincipal: ClientPrincipal | null,
    user: CurrentUserInfo | null
  ) =>
    vi.mocked(useFetch).mockImplementation(
      (url, _) =>
        Promise.resolve({
          data: ref(url === '/.auth/me' ? { clientPrincipal } : user),
          refresh: refreshMock,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any
    )

  beforeAll(() => {
    vi.mocked(useState).mockReturnValue(ref({ AuthToken: 'token' }))
    vi.mocked(useRequestHeaders).mockReturnValue({ AuthToken: 'token' })
  })
  beforeEach(() => {
    $fetchMock.mockClear()
    refreshMock.mockClear()
    vi.mocked(useFetch).mockClear()
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
      mockUseFetch(clientPrincipal, user)

      // Act
      const authComposition = await useAuth()

      // Assert
      expect(authComposition.auth.value).toStrictEqual(clientPrincipal)
      expect(authComposition.user.value).toStrictEqual(user)
      expect(authComposition.name.value).toBe(name)
      expect(authComposition.isLoggedIn.value).toBe(isLoggedIn)
      expect(authComposition.isAdmin.value).toBe(isAdmin)
    }
  )

  test('refresh() calls useFetch().refresh()', async () => {
    // Arrange
    mockUseFetch(null, null)

    // Act
    const { refresh } = await useAuth()
    await refresh()

    // Assert
    expect(refreshMock).toBeCalledTimes(2)
  })

  test('updateUser(user) updates user.value', async () => {
    // Arrange
    mockUseFetch(null, null)
    $fetchMock.mockResolvedValue(publicUser)

    // Act
    const { user, updateUser } = await useAuth()
    await updateUser(publicUser)

    // Assert
    expect($fetchMock).toBeCalled()
    expect(user.value).toStrictEqual(publicUser)
  })
})
