import { SqlParameter } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../cosmos'
import { areaCodeList } from '../db/users'
import type { NotFoundResult, SuccessResult } from '../function'
import type { User } from '../user'

export type UserListResponse = {
  next: string | null
  result: User[]
}

/** Get user list that match the specified conditions. */
const httpTrigger = async (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<NotFoundResult | SuccessResult<UserListResponse>> => {
  const clientPrincipal = getClientPrincipal(req)
  const id = clientPrincipal?.userId ?? ''

  const area = parseFloat(req.query.area)
  const name = req.query.name
  const code = parseFloat(req.query.code)
  const token = req.query.token

  // Create SQL WHERE condition dynamically
  const conditions: string[] = ['(c.isPublic = true OR c.id = @id)']
  const parameters: SqlParameter[] = [{ name: '@id', value: id }]
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

  const container = getContainer('Users', true)
  const { resources, continuationToken, hasMoreResults } = await container.items
    .query<User>(
      {
        query:
          'SELECT c.displayedId AS id, c.name, c.area, c.code ' +
          'FROM c ' +
          `WHERE ${conditions.join(' AND ')}`,
        parameters,
      },
      { continuationToken: token }
    )
    .fetchAll()

  if (resources.length === 0) {
    return { status: 404 }
  }

  const queries = parameters
    .map(p => p.name.replace('@', '&') + p.value?.toString())
    .join('')

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: {
      next: hasMoreResults
        ? `/api/v1/users?token=${continuationToken}${queries}`
        : null,
      result: resources,
    },
  }
}

export default httpTrigger
