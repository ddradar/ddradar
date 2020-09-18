import type { Context } from '@azure/functions'

import { getContainer, SongSchema } from '../db'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get song and charts information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<SongSchema>> {
  const id: string = context.bindingData.id

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id || !/^[01689bdiloqDIOPQ]{32}$/.test(id)) {
    return { status: 404 }
  }

  const container = getContainer('Songs', true)
  const { resources } = await container.items
    .query<SongSchema>({
      query:
        'SELECT c.id, c.name, c.nameKana, c.nameIndex, ' +
        'c.artist, c.series, c.minBPM, c.maxBPM, c.charts ' +
        'FROM c ' +
        'WHERE c.id = @id ' +
        'AND c.nameIndex != -1 AND c.nameIndex != -2',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll()

  if (resources.length === 0) {
    return {
      status: 404,
      body: `Not found song that id: "${id}"`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}
