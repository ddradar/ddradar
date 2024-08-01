import { type ExistsUser, routerParamsSchema as schema } from '~~/schemas/users'

/**
 * Returns whether the specified user exists.
 * @description
 * - Need Authentication.
 * - GET `/api/v2/users/[id]/exists`
 *   - `id`: User ID
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `400 Bad Request` if `id` does not match `^[-a-zA-Z0-9_]+$` pattern.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```json
 * { "id": "afro0001", "exists": true }
 * ```
 */
export default defineEventHandler(async event => {
  if (!hasRole(event, 'authenticated')) throw createError({ statusCode: 401 })

  const { id } = await getValidatedRouterParams(event, schema.parse)
  const exists = await getUserRepository(event).exists(id)

  return { id, exists } satisfies ExistsUser
})
