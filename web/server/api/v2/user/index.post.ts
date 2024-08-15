import { postBodySchema as schema } from '~~/schemas/user'

/**
 * Add or Update information about the currently logged in user.
 * @description
 * - Need Authentication.
 * - POST `/api/v2/user`
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `400 Bad Request` if body is invalid.
 * - Returns `200 OK` with JSON body if succeed.
 * @example
 * ```jsonc
 * // Request Body & Response Body
 * {
 *   "id": "afro0001",
 *   "name": "AFRO",
 *   "area": 13,
 *   "code": 10000000,
 *   "isPublic": false
 * }
 * ```
 */
export default defineEventHandler(async event => {
  const clientPrincipal = getClientPrincipal(event)
  if (!clientPrincipal) throw createError({ statusCode: 401 })
  const loginId = clientPrincipal.userId

  const user = await readValidatedBody(event, schema.parse)

  const repo = getUserRepository(event)
  const oldData = await repo.get('', loginId)

  if (!oldData) {
    await repo.create(user, loginId)
  } else if (oldData.id === user.id) {
    await repo.update(user)
  } else {
    throw createError({ statusCode: 400 })
  }
  return user
})
