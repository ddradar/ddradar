import { type UserSchema, userSchema } from '@ddradar/core'
import { type Condition, fetchList } from '@ddradar/db'
import { z } from 'zod'

export type UserInfo = Omit<UserSchema, 'loginId' | 'isPublic' | 'password'>

/** Expected queries */
const schema = z.object({
  name: z.ostring(),
  area: z.coerce
    .number()
    .pipe(userSchema.shape.area)
    .optional()
    .catch(undefined),
  code: z.coerce
    .number()
    .pipe(userSchema.shape.code)
    .optional()
    .catch(undefined),
})

/**
 * Get user list that match the specified conditions.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users?area=:area&name=:name&code=:code`
 *   - `name`(optional): {@link UserInfo.name} (partial match, ignore case)
 *   - `area`(optional): {@link UserInfo.area}
 *   - `code`(optional): {@link UserInfo.code}
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
  const loginId = getClientPrincipal(event)?.userId ?? null
  const { name, area, code } = await getValidatedQuery(event, schema.parse)

  const conditions: Condition<'Users'>[] = [
    { condition: '(c.isPublic OR c.loginId = @)', value: loginId },
  ]
  if (name) {
    conditions.push({ condition: 'CONTAINS(c.name, @, true)', value: name })
  }
  if (area) conditions.push({ condition: 'c.area = @', value: area })
  if (code !== undefined)
    conditions.push({ condition: 'c.code = @', value: code })

  return (await fetchList('Users', ['id', 'name', 'area', 'code'], conditions, {
    name: 'ASC',
  })) as UserInfo[]
})
