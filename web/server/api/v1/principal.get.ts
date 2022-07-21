import type { CompatibilityEvent } from 'h3'

import { useClientPrincipal } from '~/server/auth'

/**
 * Get CrientPrincipal.
 * @description
 * - No need Authentication.
 * - GET `api/v1/principal`
 * @param event HTTP Event
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * {
 *   "identityProvider": "github",
 *   "userId": "d75b260a64504067bfc5b2905e3b8182",
 *   "userDetails": "username",
 *   "userRoles": ["anonymous", "authenticated"]
 * }
 * ```
 */
export default (event: CompatibilityEvent) => {
  return useClientPrincipal(event)
}
