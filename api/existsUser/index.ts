import type { Context, HttpRequest } from '@azure/functions'
import type { UserInfo } from '@ddradar/core/user'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../cosmos'
import type {
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'

type ExistsUser = Pick<UserInfo, 'id'> & {
  exists: boolean
}

/** Returns whether the specified user exists. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>
): Promise<NotFoundResult | SuccessResult<ExistsUser> | UnauthenticatedResult> {
  // Authentication Check
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { status: 401 } // This check is only used to unit tests.

  const id: string = context.bindingData.id
  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id || !/^[-a-z0-9_]+$/.test(id)) {
    return { status: 404 }
  }

  const container = getContainer('Users', true)
  const { resources } = await container.items
    .query({
      query: 'SELECT c.id FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll()

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: {
      id,
      exists: !!resources.length,
    },
  }
}
