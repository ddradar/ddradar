import type { UserInfo } from '../core/api/user'
import type { AreaCode, UserSchema } from '../core/db/users'
import { Condition, fetchList, fetchOne } from '.'

export function fetchUser(id: string): Promise<UserSchema | null> {
  return fetchOne<UserSchema>(
    'Users',
    ['id', 'loginId', 'name', 'area', 'code', 'isPublic'],
    [{ condition: 'c.id = @', value: id }]
  )
}

export function fetchLoginUser(loginId: string): Promise<UserSchema | null> {
  return fetchOne<UserSchema>(
    'Users',
    ['id', 'loginId', 'name', 'area', 'code', 'isPublic'],
    [{ condition: 'c.loginId = @', value: loginId }]
  )
}

export function fetchUserList(
  loginId: string,
  area?: AreaCode,
  name?: string,
  code?: number
): Promise<UserInfo[]> {
  const columns = ['id', 'name', 'area', 'code'] as const
  const cond: Condition[] = [
    { condition: '(c.isPublic = true OR c.loginId = @)', value: loginId },
  ]
  if (area !== undefined) cond.push({ condition: 'c.area = @', value: area })
  if (name) cond.push({ condition: 'CONTAINS(c.name, @, true)', value: name })
  if (code) cond.push({ condition: 'c.code = @', value: code })
  cond.push({ condition: 'IS_DEFINED(c.loginId)' })
  return fetchList<UserInfo>('Users', columns, cond, { name: 'ASC' })
}
