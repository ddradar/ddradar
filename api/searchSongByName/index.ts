import type { SqlParameter } from '@azure/cosmos'
import type { Context, HttpRequest } from '@azure/functions'

import { getContainer } from '../cosmos'
import type { SongSchema } from '../db'
import { SeriesList } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get a list of song information that matches the specified conditions. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'query'>
): Promise<NotFoundResult | SuccessResult<SongSchema[]>> {
  const seriesIndex = parseFloat(req.query.series)
  const nameIndex =
    typeof context.bindingData.name === 'number' ? context.bindingData.name : 0 // if param is 0, passed object. (bug?)

  const isValidSeries =
    Number.isInteger(seriesIndex) &&
    seriesIndex >= 0 &&
    seriesIndex < SeriesList.length

  // In Azure Functions, this function will only be invoked if a valid `name` is passed.
  // So this check is only used to unit tests.
  if (!Number.isInteger(nameIndex) || nameIndex < 0 || nameIndex > 36) {
    return { status: 404 }
  }

  const container = getContainer('Songs', true)

  // Create SQL WHERE condition dynamically
  const column: keyof SongSchema = 'nameIndex'
  const condition: string[] = [`c.${column} = @${column}`]
  const parameters: SqlParameter[] = [{ name: `@${column}`, value: nameIndex }]
  if (isValidSeries) {
    const column: keyof SongSchema = 'series'
    condition.push(`c.${column} = @${column}`)
    parameters.push({ name: `@${column}`, value: SeriesList[seriesIndex] })
  }

  const columns: (keyof SongSchema)[] = [
    'id',
    'name',
    'nameKana',
    'nameIndex',
    'artist',
    'series',
    'minBPM',
    'maxBPM',
  ]
  const orderByColumns: (keyof SongSchema)[] = ['nameIndex', 'nameKana']
  const { resources } = await container.items
    .query<SongSchema>({
      query:
        `SELECT ${columns.map(col => `c.${col}`).join(', ')} FROM c ` +
        `WHERE ${condition.join(' AND ')} ` +
        `ORDER BY ${orderByColumns.map(col => `c.${col}`).join(', ')}`,
      parameters,
    })
    .fetchAll()

  if (resources.length === 0) {
    return {
      status: 404,
      body: `Not found song that {series: "${SeriesList[seriesIndex]}" nameIndex: ${nameIndex}}`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
