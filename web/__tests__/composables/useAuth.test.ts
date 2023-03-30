import { describe, expect, test, vi } from 'vitest'

import useAuth from '~~/composables/useAuth'
import type { CurrentUserInfo } from '~~/server/api/v1/user/index.get'
import type { ClientPrincipal } from '~~/server/utils/auth'

describe('composables/useAuth', () => {
  const generalAuth: ClientPrincipal = {
    identityProvider: 'github',
    userDetails: 'github_user',
    userId: 'abcdef',
    userRoles: ['anonymous', 'authenticated'],
  }
  const adminAuth: ClientPrincipal = {
    identityProvider: 'twitter',
    userDetails: 'twitter_admin_user',
    userId: '123456',
    userRoles: ['anonymous', 'authenticated', 'administrator'],
  }
  const generalUser: CurrentUserInfo = {
    id: 'id',
    name: 'User',
    area: 0,
    isPublic: true,
    code: 10000000,
    password: 'password',
  }
  const mockFetch = (
    auth: ClientPrincipal | null,
    user: CurrentUserInfo | null
  ) => {
    vi.mocked($fetch).mockClear()
    vi.mocked($fetch).mockImplementation(s =>
      Promise.resolve(s === '/.auth/me' ? auth : user)
    )
  }

  // Computed
  test.each([null, generalAuth, adminAuth])(
    '.auth returns %o (equals GET "/.auth/me" result)',
    async auth => {
      // Arrange
      mockFetch(auth, null)

      // Act
      const { auth: result } = await useAuth()

      // Assert
      expect(result.value).toStrictEqual(auth)
    }
  )
  test.each([null, generalUser])(
    '.user returns %o (equals GET "/api/v1/user" result)',
    async user => {
      // Arrange
      mockFetch(generalAuth, user)

      // Act
      const { user: result } = await useAuth()

      // Assert
      expect(result.value).toStrictEqual(user)
    }
  )
  test.each([
    [undefined, null],
    [generalUser.name, generalUser],
  ])('.name returns %s if .user is %o', async (name, user) => {
    // Arrange
    mockFetch(generalAuth, user)

    // Act
    const { name: result } = await useAuth()

    // Assert
    expect(result.value).toBe(name)
  })
  test.each([
    [false, null],
    [true, generalUser],
  ])('.isLoggedIn returns %o if .user is %o', async (isLoggedIn, user) => {
    // Arrange
    mockFetch(generalAuth, user)

    // Act
    const { isLoggedIn: result } = await useAuth()

    // Assert
    expect(result.value).toBe(isLoggedIn)
  })
  test.each([
    [false, null],
    [false, generalAuth],
    [true, adminAuth],
  ])('.isAdmin returns %o if .auth is %o', async (isAdmin, auth) => {
    // Arrange
    mockFetch(auth, null)

    // Act
    const { isAdmin: result } = await useAuth()

    // Assert
    expect(result.value).toBe(isAdmin)
  })

  // Method
  test('saveUser() calls POST "/api/v1/user"', async () => {
    // Arrange
    mockFetch(null, generalUser)

    // Act
    const { user, saveUser } = await useAuth()

    // Assert
    expect(user.value).toBeNull()
    await saveUser(generalUser)
    expect(user.value).toStrictEqual(generalUser)
    expect(vi.mocked($fetch)).toBeCalledWith('/api/v1/user', {
      method: 'POST',
      body: generalUser,
    })
  })
  test('logout() sets null', async () => {
    // Arrange
    mockFetch(generalAuth, generalUser)

    // Act
    const { user, auth, logout } = await useAuth()

    // Assert
    expect(auth.value).toStrictEqual(generalAuth)
    expect(user.value).toStrictEqual(generalUser)
    await logout()
    expect(vi.mocked(navigateTo)).toBeCalledWith('/.auth/logout', {
      external: true,
    })
    expect(auth.value).toBeNull()
    expect(user.value).toBeNull()
  })
})
