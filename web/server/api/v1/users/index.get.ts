import type { Database } from '@ddradar/core'
import { Condition, fetchList } from '@ddradar/db'
import { CompatibilityEvent, useQuery } from 'h3'

import { useClientPrincipal } from '~/server/auth'
import { getQueryInteger, getQueryString } from '~/server/utils'

export type UserInfo = Omit<
  Database.UserSchema,
  'loginId' | 'isPublic' | 'password'
>

/**
 * Get user list that match the specified conditions.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - `GET api/v1/users?area=:area&name=:name&code=:code`
 *   - `name`(optional): {@link UserInfo.name} (partial match, ignore case)
 *   - `area`(optional): {@link UserInfo.area}
 *   - `code`(optional): {@link UserInfo.code}
 * @param event HTTP Event
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
export default async (event: CompatibilityEvent) => {
  const loginId = useClientPrincipal(event)?.userId ?? null
  const query = useQuery(event)
  const name = getQueryString(query, 'name')
  const area = getQueryInteger(query, 'area')
  const code = getQueryInteger(query, 'code')

  const conditions: Condition<'Users'>[] = [
    { condition: '(c.isPublic OR c.loginId = @)', value: loginId },
  ]
  if (name)
    conditions.push({ condition: 'CONTAINS(c.name, @, true)', value: name })
  if (!isNaN(area)) conditions.push({ condition: 'c.area = @', value: area })
  if (!isNaN(code)) conditions.push({ condition: 'c.code = @', value: code })

  return (await fetchList('Users', ['id', 'name', 'area', 'code'], conditions, {
    name: 'ASC',
  })) as UserInfo[]
}
