import { getCurrentUser } from '~~/server/db/utils'

// https://docs.x.com/x-api/users/get-my-user
interface XUser {
  id: string
  name: string
  profile_image_url: string
}

export default defineOAuthXEventHandler({
  async onSuccess(event, { user: oAuthUser }: { user: XUser }) {
    const currentUser = await getCurrentUser('x', oAuthUser.id)
    await setUserSession(event, {
      user: {
        id: currentUser?.id,
        provider: 'x',
        providerId: oAuthUser.id,
        roles: currentUser?.roles ?? [],
        displayName: currentUser?.name ?? oAuthUser.name,
        avatarUrl: oAuthUser.profile_image_url,
      },
      loggedInAt: new Date(),
    })
    if (!currentUser) return sendRedirect(event, '/profile')

    // oxlint-disable-next-line typescript/prefer-nullish-coalescing - change '' to '/'
    const to = getCookie(event, 'redirect') || '/'
    deleteCookie(event, 'redirect')
    return sendRedirect(event, to)
  },
  onError(event, error) {
    console.error('X OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
