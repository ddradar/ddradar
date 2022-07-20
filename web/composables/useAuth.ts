import { computed, ref } from 'vue'

import { useRequestHeaders } from '#app'
import type { CurrentUserInfo } from '~/server/api/v1/user/index.get'
import type { ClientPrincipal } from '~/server/auth'

/**
 * GET `/.auth/me` response body
 * @see https://docs.microsoft.com/azure/static-web-apps/user-information?tabs=javascript#direct-access-endpoint
 */
type AuthResult = {
  clientPrincipal: ClientPrincipal | null
}

export default async function useAuth() {
  const getClientCookies = () =>
    useRequestHeaders(['cookie']) as Record<string, string>

  // Inner variables
  const authInner = ref<ClientPrincipal | null>()
  const userInner = ref<CurrentUserInfo | null>()

  const refresh = async () => {
    const headers = getClientCookies()
    authInner.value = (
      await $fetch<AuthResult>('/.auth/me', { headers })
    ).clientPrincipal
    userInner.value = await $fetch('/api/v1/user', { headers })
  }
  await refresh()

  const auth = computed(() => authInner.value)
  const user = computed(() => userInner.value as CurrentUserInfo | null)
  const name = computed(() => user.value?.name)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(
    () => auth.value?.userRoles.includes('administrator') ?? false
  )

  const updateUser = async (body: CurrentUserInfo) => {
    userInner.value = await $fetch<CurrentUserInfo>('/api/v1/user', {
      headers: getClientCookies(),
      method: 'post',
      body,
    })
  }

  return {
    /** Client Principal data */ auth,
    /** Current user info */ user,
    /** User name */ name,
    /** Logeedin ot not */ isLoggedIn,
    /** User has administrator role or not */ isAdmin,
    /** Reload auth and user. */ refresh,
    /** Update current user info. */ updateUser,
  }
}
