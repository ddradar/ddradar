import { fetchOne } from '@ddradar/db'

import type { ExistsUser } from '~~/schemas/user'
import { paramsSchema as schema } from '~~/schemas/user'

/**
 * Returns whether the specified user exists.
 * @description
 * - Need Authentication.
 * - GET `api/v1/users/:id/exists`
 *   - `id`: {@link ExistsUser.id}
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

  const condition = { condition: 'c.id = @', value: id } as const
  const user = await fetchOne('Users', ['id'], condition)

  return { id, exists: !!user } as ExistsUser
})
