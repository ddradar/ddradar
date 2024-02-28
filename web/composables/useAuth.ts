import type { CurrentUserInfo } from '~~/server/api/v1/user/index.get'
import { type ClientPrincipal, useClientPrincipal } from '~~/server/utils/auth'

export default async function useAuth() {
  const auth = useState<ClientPrincipal | null>('auth')
  const user = useState<CurrentUserInfo | null>('user')

  auth.value = process.server
    ? useClientPrincipal(useRequestHeaders())
    : (await $fetch<{ clientPrincipal: ClientPrincipal | null }>('/.auth/me'))
        .clientPrincipal
  try {
    user.value = auth.value
      ? await $fetch('/api/v1/user', {
          headers: useRequestHeaders(['x-ms-client-principal']),
        })
      : null
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

  const saveUser = async (body: CurrentUserInfo) => {
    user.value = await $fetch('/api/v1/user', { method: 'POST', body })
  }

  return {
    auth: computedAuth,
    user: computedUser,
    id,
    name,
    isLoggedIn,
    isAdmin,
    saveUser,
  }
}
