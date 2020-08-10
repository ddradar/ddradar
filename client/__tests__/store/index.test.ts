import { ClientPrincipal } from '~/api/auth'
import { actions, getters, mutations, RootState, state } from '~/store'
import type { User } from '~/types/api/user'

const auth: ClientPrincipal = {
  identityProvider: 'github',
  userId: 'auto-generated-id',
  userDetails: 'foo',
  userRoles: ['anonymous', 'authenticated'],
}
const user: User = {
  id: 'foo',
  name: 'Some User',
  area: 13,
  isPublic: true,
  code: 10000000,
} as const

describe('./store/index.ts', () => {
  describe('state', () => {
    test('returns { auth: null, user: null }', () => {
      expect(state()).toStrictEqual({ auth: null, user: null })
    })
  })
  describe('getters', () => {
    describe('name', () => {
      test('returns user.name', () => {
        // Arrange
        const state: RootState = {
          auth: null,
          user,
        }

        // Act - Assert
        expect(getters.name(state)).toBe(user.name)
      })
      test('returns undefined if user is null', () => {
        // Arrange
        const state: RootState = { auth: null, user: null }

        // Act - Assert
        expect(getters.name(state)).toBeUndefined()
      })
    })
  })
  describe('mutations', () => {
    test.each([
      [{ auth: null, user: null }, auth],
      [{ auth, user }, null],
    ])('setAuth(state, %p) changes state.auth', (state, auth) => {
      // Arrange - Act
      mutations.setAuth(state, auth)

      // Assert
      expect(state.auth).toStrictEqual(auth)
    })
    test.each([
      [{ auth: null, user: null }, user],
      [{ auth, user }, null],
    ])('setUser(state, %p) changes state.user', (state, user) => {
      // Arrange - Act
      mutations.setUser(state, user)

      // Assert
      expect(state.user).toStrictEqual(user)
    })
  })
  describe('actions', () => {
    describe('logout', () => {
      test('calls setAuth(null) and setUser(null)', () => {
        const commit = jest.fn()

        // @ts-ignore
        actions.logout({ commit })

        expect(commit).toBeCalledWith('setAuth', null)
        expect(commit).toBeCalledWith('setUser', null)
      })
    })
  })
})
