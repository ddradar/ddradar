import type { User } from '@ddradar/core'
import type { H3Event } from 'h3'

import { routerParamsSchema as schema } from '~~/schemas/users'

/**
 * Get login user information from Authentication header.
 * @param event HTTP Event (needs Authentication header)
 * @returns {User} Login user information
 * @throws
 * - Throws `401 Unauthorized` error when you are not logged in.
 * - Throws `404 Not Found` error when user registration is not completed.
 */
export async function getLoginUserInfo(event: H3Event): Promise<User> {
  const clientPrincipal = getClientPrincipal(event)
  if (!clientPrincipal) throw createError({ statusCode: 401 })

  const user = await getUserRepository(event).get('', clientPrincipal.userId)
  if (!user) throw createError({ statusCode: 404 })
  return user
}

/**
 * Get user information that match the specified ID.
 * @param event HTTP Event (needs [id] context)
 * @returns {User} User information
 * @throws
 * - Throws `404 Not Found` when `id` is not defined.
 * - Throws `404 Not Found` when no user that matches `id` or user is private.
 */
export async function getUser(event: H3Event): Promise<User> {
  const result = await getValidatedRouterParams(event, schema.safeParse)
  if (!result.success) throw createError({ statusCode: 404 })

  const loginId = getClientPrincipal(event)?.userId
  const user = await getUserRepository(event).get(result.data.id, loginId)
  if (!user) throw createError({ statusCode: 404 })
  return user
}
