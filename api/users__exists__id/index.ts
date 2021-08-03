import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { SuccessResult } from '../function'

/**
 * Returns whether the specified user exists.
 * @description
 * - `GET api/v1/users/exists/:id`
 * - Need Authentication.
 * @param bindingData.id UserId
 * @param _req HTTP Request (unused)
 * @param user User data
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if `id` does not match `^[-a-zA-Z0-9_]+$` pattern.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```json
 * {
 *   "id": "afro0001",
 *   "exists": true
 * }
 * ```
 */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [user]: unknown[]
): Promise<SuccessResult<Api.ExistsUser>> {
  return new SuccessResult({ id: bindingData.id, exists: !!user })
}
