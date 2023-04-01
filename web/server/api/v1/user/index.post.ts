import type { UserSchema } from '@ddradar/core'
import { isUserSchema } from '@ddradar/core'
import { fetchLoginUser, fetchUser, getContainer } from '@ddradar/db'
import { readBody } from 'h3'

import { useClientPrincipal } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'

/**
 * Add or Update information about the currently logged in user.
 * @description
 * - Need Authentication.
 * - POST `api/v1/user`
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
export default defineEventHandler(async event => {
  const clientPrincipal = useClientPrincipal(event.node.req.headers)
  if (!clientPrincipal) return sendNullWithError(event, 401)
  const loginId = clientPrincipal.userId

  const body = await readBody(event)
  if (!isUserSchema(body)) {
    return sendNullWithError(event, 400, 'Invalid Body')
  }

  // Read existing data
  const oldData = (await fetchUser(body.id)) ?? (await fetchLoginUser(loginId))

  if (oldData && (oldData.id !== body.id || oldData.loginId !== loginId)) {
    return sendNullWithError(event, 400, 'Duplicated Id')
  }

  // Merge existing data with new data
  const user: UserSchema = {
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
})
