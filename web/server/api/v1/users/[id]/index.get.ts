import { Database } from '@ddradar/core'
import { fetchOne } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'

import type { UserInfo } from '~/server/api/v1/users/index.get'
import { useClientPrincipal } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

/**
 * Get user information that match the specified ID.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/:id`
 *   - `id`: {@link UserInfo.id}
 * @param event HTTP Event
 * @returns
 * - Returns `404 Not Found` if `id` is not defined.
 * - Returns `404 Not Found` if no user that matches `id` or user is private.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * {
 *   "id": "afro0001",
 *   "name": "AFRO",
 *   "area": 13,
 *   "code": 10000000
 * }
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const id: string = event.context.params.id
  if (!Database.isValidUserId(id)) return sendNullWithError(event, 404)

  const loginId = useClientPrincipal(event)?.userId ?? null

  const user = await fetchOne(
    'Users',
    ['id', 'name', 'area', 'code'],
    { condition: 'c.id = @', value: id },
    { condition: '(c.isPublic OR c.loginId = @)', value: loginId }
  )

  return (user as UserInfo) ?? sendNullWithError(event, 404)
}
