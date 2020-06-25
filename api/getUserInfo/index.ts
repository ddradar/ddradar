import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../cosmos'
import type { NotFoundResult, SuccessResult } from '../function'
import type { User } from '../user'

/** Get user information that match the specified ID. */
const httpTrigger = async (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>
): Promise<NotFoundResult | SuccessResult<User>> => {
  const id: string = context.bindingData.id
  const clientPrincipal = getClientPrincipal(req)
  const loginId = clientPrincipal?.userId ?? ''

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id || !/^[-a-z0-9_]+$/.test(id)) {
    return { status: 404, body: 'Please pass a id like "/api/v1/users/:id"' }
  }

  const container = getContainer('Users', true)
  const { resources } = await container.items
    .query<User>({
      query:
        'SELECT c.id, c.name, c.area, c.code ' +
        'FROM c ' +
        'WHERE c.id = @id ' +
        'AND (c.isPublic = true OR c.loginId = @loginId)',
      parameters: [
        { name: '@id', value: id },
        { name: '@loginId', value: loginId },
      ],
    })
    .fetchAll()

  if (resources.length === 0) {
    return { status: 404, body: `Not found user that id: "${id}"` }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}

export default httpTrigger
