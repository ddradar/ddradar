import { SqlParameter } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../db'
import { areaCodeList } from '../db/users'
import type { SuccessResult } from '../function'
import type { User } from '../user'

/** Get user list that match the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<SuccessResult<User[]>> {
  const clientPrincipal = getClientPrincipal(req)
  const loginId = clientPrincipal?.userId ?? ''

  const area = parseFloat(req.query.area)
  const name = req.query.name
  const code = parseFloat(req.query.code)

  // Create SQL WHERE condition dynamically
  const conditions: string[] = [
    'IS_DEFINED(c.loginId)',
    '(c.isPublic = true OR c.loginId = @loginId)',
  ]
  const parameters: SqlParameter[] = [{ name: '@loginId', value: loginId }]
  if ((areaCodeList as number[]).includes(area)) {
    conditions.push('c.area = @area')
    parameters.push({ name: '@area', value: area })
  }
  if (name) {
    conditions.push('CONTAINS(c.name, @name, true)')
    parameters.push({ name: '@name', value: name })
  }
  if (Number.isInteger(code) && code >= 10000000 && code <= 99999999) {
    conditions.push('c.code = @code')
    parameters.push({ name: '@code', value: code })
  }

  const columns: (keyof User)[] = ['id', 'name', 'area', 'code']
  const container = getContainer('Users', true)
  const { resources } = await container.items
    .query<User>({
      query:
        'SELECT ' +
        columns.map(col => `c.${col}`).join(', ') +
        ' FROM c ' +
        `WHERE ${conditions.join(' AND ')}`,
      parameters,
    })
    .fetchNext()

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
