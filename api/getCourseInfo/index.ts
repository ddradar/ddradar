import type { Context } from '@azure/functions'

import { CourseSchema, getContainer } from '../db'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<CourseSchema>> {
  const id: string = context.bindingData.id

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id || !/^[01689bdiloqDIOPQ]{32}$/.test(id)) {
    return { status: 404 }
  }

  const container = getContainer('Songs')
  const columns: (keyof CourseSchema)[] = [
    'id',
    'name',
    'nameKana',
    'nameIndex',
    'series',
    'minBPM',
    'maxBPM',
    'charts',
  ]
  const { resources } = await container.items
    .query<CourseSchema>({
      query:
        `SELECT ${columns.map(col => `c.${col}`).join(', ')} ` +
        'FROM c ' +
        'WHERE c.id = @id ' +
        'AND (c.nameIndex = -1 OR c.nameIndex = -2)',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll()

  if (resources.length === 0) {
    return {
      status: 404,
      body: `Not found course that id: "${id}"`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}
