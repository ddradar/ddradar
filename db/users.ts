import type { Database } from '@ddradar/core'

import type { Condition } from './database'
import { fetchOne } from './database'

/**
 * Returns {@link Database.UserSchema} that matches `id`.
 * @param id User id (displayed Id)
 */
export function fetchUser(id: string): Promise<Database.UserSchema | null> {
  return fetchSpecifiedUser({ condition: 'c.id = @', value: id })
}

/**
 * Returns {@link Database.UserSchema} that matches `loginId`.
 * @param loginId User login id (Auto generated by Azure Authentication)
 */
export function fetchLoginUser(
  loginId: string
): Promise<Database.UserSchema | null> {
  return fetchSpecifiedUser({ condition: 'c.loginId = @', value: loginId })
}

function fetchSpecifiedUser(condition: Condition<'Users'>) {
  return fetchOne(
    'Users',
    ['id', 'loginId', 'name', 'area', 'code', 'isPublic', 'password'],
    condition
  )
}
