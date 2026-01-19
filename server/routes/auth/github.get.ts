import { getCurrentUser } from '~~/server/db/utils'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: oAuthUser }) {
    const currentUser = await getCurrentUser('github', `${oAuthUser.id}`)
    await setUserSession(event, {
      user: {
        id: currentUser?.id,
        provider: 'github',
        providerId: `${oAuthUser.id}`,
        roles: currentUser?.roles ?? [],
        displayName: currentUser?.name ?? (oAuthUser.name || oAuthUser.login),
        avatarUrl: oAuthUser.avatar_url,
      },
      loggedInAt: new Date(),
    })
    if (!currentUser) return sendRedirect(event, '/profile')

    const to = getCookie(event, 'redirect') || '/'
    deleteCookie(event, 'redirect')
    return sendRedirect(event, to)
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
