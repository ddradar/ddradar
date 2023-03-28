import type { CurrentUserInfo } from "~~/server/api/v1/user/index.get"
import type { ClientPrincipal } from "~~/server/utils/auth"

export default async function useAuth() {
  const config = useRuntimeConfig()
  const { data: auth } = await useFetch<ClientPrincipal>(`${config.public.apiBase}/.auth/me`)
  const user = ref<CurrentUserInfo | null>(null)
  if (auth.value)
    user.value = (await useFetch<CurrentUserInfo>('/api/v1/user')).data.value

  const computedAuth = computed(() => auth.value)
  const computedUser = computed(() => user.value)
  const name = computed(() => user.value?.name)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => !!auth.value?.userRoles.includes('administrator'))

  const saveUser = async (body: CurrentUserInfo) => {
    const { data } = await useFetch('/api/v1/user', { method: 'POST', body })
    user.value = data.value
  }
  const logout = () => {
    auth.value = null
    user.value = null
  }

  return {
    auth: computedAuth,
    user: computedUser,
    name,
    isLoggedIn,
    isAdmin,
    saveUser,
    logout
  }
}
