import { Database } from '@ddradar/core'
import { fetchOne } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'

import { sendNullWithError } from '~/server/utils'

export type ExistsUser = Pick<Database.UserSchema, 'id'> & {
  /** User exists or not */
  exists: boolean
}

/**
 * Returns whether the specified user exists.
 * @description
 * - Need Authentication.
 * - GET `api/v1/users/:id/exists`
 *   - `id`: {@link ExistsUser.id}
 * @param event HTTP Event
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if `id` does not match `^[-a-zA-Z0-9_]+$` pattern.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```json
 * { "id": "afro0001", "exists": true }
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const id: string = event.context.params.id
  if (!Database.isValidUserId(id)) return sendNullWithError(event, 404)

  const condition = { condition: 'c.id = @', value: id } as const
  const user = await fetchOne('Users', ['id'], condition)

  return { id, exists: !!user } as ExistsUser
}
