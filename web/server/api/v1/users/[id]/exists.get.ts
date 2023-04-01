import type { UserSchema } from '@ddradar/core'
import { isValidUserId } from '@ddradar/core'
import { fetchOne } from '@ddradar/db'

import { sendNullWithError } from '~~/server/utils/http'

export type ExistsUser = Pick<UserSchema, 'id'> & {
  /** User exists or not */
  exists: boolean
}

/**
 * Returns whether the specified user exists.
 * @description
 * - Need Authentication.
 * - GET `api/v1/users/:id/exists`
 *   - `id`: {@link ExistsUser.id}
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if `id` does not match `^[-a-zA-Z0-9_]+$` pattern.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```json
 * { "id": "afro0001", "exists": true }
 * ```
 */
export default defineEventHandler(async event => {
  const id: string = event.context.params!.id
  if (!isValidUserId(id)) return sendNullWithError(event, 404)

  const condition = { condition: 'c.id = @', value: id } as const
  const user = await fetchOne('Users', ['id'], condition)

  return { id, exists: !!user } as ExistsUser
})
