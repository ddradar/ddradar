export default defineNuxtRouteMiddleware(async to => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    const redirect = useCookie('redirect')
    redirect.value = to.fullPath
    return navigateTo('/login')
  }
})
