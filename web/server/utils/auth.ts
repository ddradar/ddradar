import type { UserSchema } from '@ddradar/core'
import { fetchLoginUser, fetchUser } from '@ddradar/db'
import type { H3Event } from 'h3'

import { paramsSchema } from '~/schemas/user'

export async function getLoginUserInfo(
  event: H3Event
): Promise<UserSchema | null> {
  const clientPrincipal = getClientPrincipal(event)
  if (!clientPrincipal) return null
  return await fetchLoginUser(clientPrincipal.userId)
}

/**
 * Check user visibility
 * @param event HTTP Event (needs [id] context)
 * @returns UserSchema if user is public or same as login user. otherwise null.
 */
export async function tryFetchUser(event: H3Event): Promise<UserSchema | null> {
  const result = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!result.success) return null

  const user = await fetchUser(result.data.id)
  if (!user) return null

  const loginId = getClientPrincipal(event)?.userId ?? ''
  return user.isPublic || user.loginId === loginId ? user : null
}
