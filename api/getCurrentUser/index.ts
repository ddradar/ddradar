import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../cosmos'
import {
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import { User } from '../user'

/** Get information about the currently logged in user. */
const httpTrigger = async (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>
): Promise<NotFoundResult | SuccessResult<User> | UnauthenticatedResult> => {
  const clientPrincipal = getClientPrincipal(req)
  // This check is only used to unit tests.
  if (!clientPrincipal) return { status: 401 }

  const loginId = clientPrincipal.userId

  const container = getContainer('Users', true)
  const { resources } = await container.items
    .query<User>({
      query:
        'SELECT c.id, c.name, c.area, c.code ' +
        'FROM c ' +
        'WHERE c.loginId = @loginId',
      parameters: [{ name: '@loginId', value: loginId }],
    })
    .fetchAll()

  if (resources.length === 0) {
    return { status: 404, body: 'User registration is not completed' }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}

export default httpTrigger
