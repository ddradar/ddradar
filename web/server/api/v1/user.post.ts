import { Database } from '@ddradar/core'
import { fetchLoginUser, fetchUser, getContainer } from '@ddradar/db'
import { CompatibilityEvent, createError, sendError, useBody } from 'h3'

import { useClientPrincipal } from '~/server/auth'

/**
 * Add or Update information about the currently logged in user.
 * @description
 * - Need Authentication.
 * - POST `api/v1/user`
 * @param event HTTP Event
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `400 Bad Request` if parameter is invalid.
 * - Returns `200 OK` with JSON body if succeed.
 * @example
 * ```jsonc
 * // Request Body & Response Body
 * {
 *   "id": "afro0001",
 *   "name": "AFRO",
 *   "area": 13,
 *   "code": 10000000,
 *   "isPublic": false,
 *   "password": "********"
 * }
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const clientPrincipal = useClientPrincipal(event)
  if (!clientPrincipal) {
    sendError(event, createError({ statusCode: 401 }))
    return null
  }
  const loginId = clientPrincipal.userId

  const body = await useBody(event)
  if (!Database.isUserSchema(body)) {
    sendError(event, createError({ statusCode: 400, message: 'Invalid Body' }))
    return null
  }

  // Read existing data
  const oldData = (await fetchUser(body.id)) ?? (await fetchLoginUser(loginId))

  if (oldData && (oldData.id !== body.id || oldData.loginId !== loginId)) {
    sendError(event, createError({ statusCode: 400, message: 'Duplicated Id' }))
    return null
  }

  // Merge existing data with new data
  const user: Database.UserSchema = {
    id: oldData?.id ?? body.id,
    name: body.name,
    area: oldData?.area ?? body.area,
    isPublic: body.isPublic,
    ...(body.code ? { code: body.code } : {}),
    ...(body.password ? { password: body.password } : {}),
  }

  await getContainer('Users').items.upsert({
    ...user,
    loginId: oldData?.loginId ?? loginId,
  })

  return user
}
