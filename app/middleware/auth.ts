export default defineNuxtRouteMiddleware(async to => {
  const { loggedIn, user } = useUserSession()

  if (to.meta.roles) {
    if (
      !(to.meta.roles as string[]).find(role =>
        user.value?.roles.includes(role)
      )
    ) {
      abortNavigation({ status: 403, statusText: 'Forbidden' })
    }
    return
  }

  if (!loggedIn.value) {
    const redirect = useCookie('redirect')
    redirect.value = to.fullPath
    return navigateTo('/login')
  }
})
