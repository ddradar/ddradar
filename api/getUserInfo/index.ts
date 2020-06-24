import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../cosmos'
import type { UserSchema } from '../db'

type User = Pick<UserSchema, 'name' | 'area' | 'code'> & {
  /** User id (used for user page URL) */
  id: string
}

type NotFoundResult = {
  status: 404
  body: string
}

type SuccessResult<T> = {
  status: 200
  headers: { 'Content-type': 'application/json' }
  body: T
}

/** Get user information that match the specified ID. */
const httpTrigger = async (
  context: Pick<Context, 'bindingData' | 'res'>,
  req: Pick<HttpRequest, 'headers'>
): Promise<NotFoundResult | SuccessResult<User>> => {
  const displayedId: string = context.bindingData.id
  const clientPrincipal = getClientPrincipal(req)
  const id = clientPrincipal?.userId ?? ''

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!displayedId || !/^[-a-z0-9_]+$/.test(displayedId)) {
    return { status: 404, body: 'Please pass a id like "/api/v1/users/:id"' }
  }

  const container = getContainer('Users', true)
  const { resources } = await container.items
    .query<User>({
      query:
        'SELECT c.displayedId AS id, c.name, c.area, c.code ' +
        'FROM c ' +
        'WHERE c.displayedId = @displayedId ' +
        'AND (c.isPublic = true OR c.id = @id)',
      parameters: [
        { name: '@displayedId', value: displayedId },
        { name: '@id', value: id },
      ],
    })
    .fetchAll()

  if (resources.length === 0) {
    return { status: 404, body: `Not found user that id: "${displayedId}"` }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}

export default httpTrigger
