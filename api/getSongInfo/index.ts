import type { AzureFunction, Context } from '@azure/functions'

import { getContainer } from '../cosmos'
import { SongSchema } from '../song'

/** Get song and charts information that match the specified ID. */
const httpTrigger: AzureFunction = async (
  context: Pick<Context, 'bindingData' | 'res'>
): Promise<void> => {
  const id: string = context.bindingData.id

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id || !/^[01689bdiloqDIOPQ]{32}$/.test(id)) {
    context.res = {
      status: 404,
      body: 'Please pass a id like "/api/songs/:id"',
    }
    return
  }

  const container = getContainer('Songs', true)
  const { resources } = await container.items
    .query<SongSchema>({
      query:
        'SELECT c.id, c.name, c.nameKana, c.nameIndex, ' +
        'c.artist, c.series, c.minBPM, c.maxBPM, c.charts ' +
        'FROM c ' +
        'WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll()

  if (resources.length === 0) {
    context.res = {
      status: 404,
      body: `Not found song that id: "${id}"`,
    }
    return
  }

  context.res = {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}

export default httpTrigger
