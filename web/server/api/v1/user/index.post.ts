import { type UserSchema, userSchema } from '@ddradar/core'
import { fetchLoginUser, fetchUser, getContainer } from '@ddradar/db'

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
  const clientPrincipal = getClientPrincipal(event)
  if (!clientPrincipal) throw createError({ statusCode: 401 })
  const loginId = clientPrincipal.userId

  const body = await readValidatedBody(event, userSchema.parse)

  // Read existing data
  const oldData = (await fetchUser(body.id)) ?? (await fetchLoginUser(loginId))

  if (oldData && (oldData.id !== body.id || oldData.loginId !== loginId)) {
    throw createError({ statusCode: 400, message: 'Duplicated Id' })
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
    isAdmin: oldData?.isAdmin ?? false,
  })

  return user
})
