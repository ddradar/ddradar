import { getCurrentUser } from '~~/server/db/utils'

// https://developers.line.biz/ja/reference/line-login/#profile
export default defineOAuthLineEventHandler({
  async onSuccess(event, { user: oAuthUser }) {
    const currentUser = await getCurrentUser('line', oAuthUser.userId)
    await setUserSession(event, {
      user: {
        id: currentUser?.id,
        provider: 'line',
        providerId: oAuthUser.userId,
        roles: currentUser?.roles ?? [],
        displayName: currentUser?.name ?? oAuthUser.displayName,
        avatarUrl: oAuthUser.pictureUrl,
      },
      loggedInAt: new Date(),
    })
    if (!currentUser) return sendRedirect(event, '/profile')

    const to = getCookie(event, 'redirect') || '/'
    setCookie(event, 'redirect', '')
    return sendRedirect(event, to)
  },
  onError(event, error) {
    console.error('Line OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
