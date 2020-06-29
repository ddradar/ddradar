import { actionTree, getAccessorType, mutationTree } from 'typed-vuex'

import { AuthResult, ClientPrincipal } from '~/types/api/auth'
import { User } from '~/types/api/user'

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
      const { clientPrincipal } = await this.$http.$get<AuthResult>('/.auth/me')
      commit('setAuth', clientPrincipal)

      if (!clientPrincipal) {
        // Not login
        commit('setUser', null)
        return
      }

      try {
        const user = await this.$http.$get<User>('/api/v1/user')
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
      const response = await this.$http.$post<User>('/api/v1/user', user)
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
