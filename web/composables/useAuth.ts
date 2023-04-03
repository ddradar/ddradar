import type { CurrentUserInfo } from '~~/server/api/v1/user/index.get'
import { ClientPrincipal, useClientPrincipal } from '~~/server/utils/auth'

export default async function useAuth() {
  const auth = ref<ClientPrincipal | null>(null)
  const user = ref<CurrentUserInfo | null>(null)

  auth.value = process.server
    ? useClientPrincipal(useRequestHeaders())
    : await $fetch<ClientPrincipal>('/.auth/me')
  try {
    if (auth.value) user.value = await $fetch<CurrentUserInfo>('/api/v1/user')
  } catch (error) {
    user.value = null
  }

  const computedAuth = computed(() => auth.value)
  const computedUser = computed(() => user.value)
  const id = computed(() => user.value?.id)
  const name = computed(() => user.value?.name)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(
    () => !!auth.value?.userRoles.includes('administrator')
  )

  const login = async (provider: ClientPrincipal['identityProvider']) => {
    const { path } = useRoute()
    const loginUri = `/.auth/login/${provider}?post_login_redirect_uri=${path}`
    await navigateTo(loginUri, { external: true })
  }
  const saveUser = async (body: CurrentUserInfo) => {
    user.value = await $fetch('/api/v1/user', { method: 'POST', body })
  }
  const logout = async () => {
    await navigateTo('/.auth/logout', { external: true })
    auth.value = null
    user.value = null
  }

  return {
    auth: computedAuth,
    user: computedUser,
    id,
    name,
    isLoggedIn,
    isAdmin,
    login,
    saveUser,
    logout,
  }
}
