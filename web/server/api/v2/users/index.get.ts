import type { UserInfo } from '~~/schemas/users'
import { listQuerySchema as schema } from '~~/schemas/users'

type Condition = Parameters<
  ReturnType<typeof getUserRepository>['list']
>[0][number]

/**
 * Get user list that match the specified conditions.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `/api/v2/users?area=:area&name=:name&code=:code`
 *   - `name`(optional): User Name (partial match, ignore case)
 *   - `area`(optional): Area ID
 *   - `code`(optional): DDR Code
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "afro0001",
 *     "name": "AFRO",
 *     "area": 13,
 *     "code": 10000000
 *   },
 *   {
 *     "id": "emi",
 *     "name": "TOSHIBA EMI",
 *     "area": 0
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const loginId = getClientPrincipal(event)?.userId
  const { name, area, code } = await getValidatedQuery(event, schema.parse)

  const conditions: Condition[] = []
  if (name) {
    conditions.push({ condition: 'CONTAINS(c.name, @, true)', value: name })
  }
  if (area) conditions.push({ condition: 'c.area = @', value: area })
  if (code !== undefined)
    conditions.push({ condition: 'c.code = @', value: code })

  return (await getUserRepository(event).list(
    conditions,
    loginId
  )) satisfies UserInfo[]
})
