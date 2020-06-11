import type { AzureFunction, Context, HttpRequest } from '@azure/functions'

import { getContainer } from '../cosmos'
import { SongSchema } from '../song'

/** Add or update song and charts information. */
const httpTrigger: AzureFunction = async (
  context: Pick<Context, 'bindingData' | 'res'>,
  req: HttpRequest
): Promise<void> => {
  const id: string = context.bindingData.id

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id || !/^[01689bdiloqDIOPQ]{32}$/.test(id)) {
    context.res = {
      status: 404,
      body: 'Please pass a id like "/api/admin/songs/:id"',
    }
    return
  }

  const container = getContainer('Songs', true)
  const { resource } = await container.items.upsert<SongSchema>(req.body)

  context.res = {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resource,
  }
}

export default httpTrigger
