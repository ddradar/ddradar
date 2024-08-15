import type { UserInfo } from '~~/schemas/users'

/**
 * Get user information that match the specified ID.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `/api/v2/users/[id]`
 *   - `id`: User ID
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
export default defineEventHandler(async event => {
  const user = await getUser(event)
  return {
    id: user.id,
    name: user.name,
    area: user.area,
    code: user.code,
  } satisfies UserInfo
})
