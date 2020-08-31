import { actionTree, getAccessorType, mutationTree } from 'typed-vuex'

import { ClientPrincipal, getClientPrincipal } from '~/api/auth'
import { getCurrentUser, postUserInfo, User } from '~/api/user'

export type RootState = {
  auth: ClientPrincipal | null
  user: User | null
}

export const state = (): RootState => ({
  auth: null,
  user: null,
})

export const getters = {
  name: (state: RootState) => state.user?.name,
  isLoggedIn: (state: RootState) => !!state.user,
  isAdmin: (state: RootState) =>
    state.auth?.userRoles.includes('administrator') ?? false,
}

export const mutations = mutationTree(state, {
  setAuth(state, auth: ClientPrincipal | null) {
    state.auth = auth
  },
  setUser(state, user: User | null) {
    state.user = user
  },
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    async fetchUser({ commit }) {
      const clientPrincipal = await getClientPrincipal(this.$http)
      commit('setAuth', clientPrincipal)

      if (!clientPrincipal) {
        // Not login
        commit('setUser', null)
        return
      }

      try {
        const user = await getCurrentUser(this.$http)
        commit('setUser', user)
      } catch {
        commit('setUser', null)
      }
    },
    logout({ commit }) {
      commit('setAuth', null)
      commit('setUser', null)
    },
    async saveUser({ commit }, user: User) {
      const response = await postUserInfo(this.$http, user)
      commit('setUser', response)
    },
  }
)

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
})
