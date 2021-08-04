import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { SuccessResult } from '../function'

type ExistsUser = Api.ExistsUser

/**
 * Returns whether the specified user exists.
 * @description
 * - Need Authentication.
 * - `GET api/v1/users/exists/:id`
 *   - `id`: {@link ExistsUser.id}
 * @param bindingData.id {@link ExistsUser.id}
 * @param _req HTTP Request (unused)
 * @param user User data (from Cosmos DB binding)
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if `id` does not match `^[-a-zA-Z0-9_]+$` pattern.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```json
 * { "id": "afro0001", "exists": true }
 * ```
 */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [user]: unknown[]
): Promise<SuccessResult<ExistsUser>> {
  return new SuccessResult({ id: bindingData.id, exists: !!user })
}
