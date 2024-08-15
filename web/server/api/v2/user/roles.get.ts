import { getRolesBodySchema as schema } from '~~/schemas/user'

/**
 * Get user roles. (called from Azure Static Web Apps)
 * https://learn.microsoft.com/azure/static-web-apps/authentication-custom?tabs=aad%2Cfunction#manage-roles
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * {
 *   "roles": ["administrator"]
 * }
 * ```
 */
export default defineEventHandler(async event => {
  const { userId } = await readValidatedBody(event, schema.parse)
  const isAdmin = await getUserRepository(event).isAdministrator(userId)

  return { roles: isAdmin ? ['administrator'] : [] }
})
