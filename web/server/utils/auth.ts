import { type UserSchema, userSchema } from '@ddradar/core'
import { fetchLoginUser, fetchUser } from '@ddradar/db'
import type { H3Event } from 'h3'

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
  const id: string = event.context.params!.id
  if (!userSchema.shape.id.safeParse(id).success) return null

  const user = await fetchUser(id)
  if (!user) return null

  const loginId = getClientPrincipal(event)?.userId ?? ''
  return user.isPublic || user.loginId === loginId ? user : null
}
