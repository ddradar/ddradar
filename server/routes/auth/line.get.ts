import { getCurrentUser } from '~~/server/db/utils'

// https://developers.line.biz/ja/reference/line-login/#profile
interface LineUser {
  userId: string
  displayName: string
  pictureUrl: string
}

export default defineOAuthLineEventHandler({
  async onSuccess(event, { user: oAuthUser }: { user: LineUser }) {
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

    // oxlint-disable-next-line typescript/prefer-nullish-coalescing - change '' to '/'
    const to = getCookie(event, 'redirect') || '/'
    deleteCookie(event, 'redirect')
    return sendRedirect(event, to)
  },
  onError(event, error) {
    console.error('Line OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
