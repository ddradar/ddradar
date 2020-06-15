import { SqlParameter } from '@azure/cosmos'
import type { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { SeriesList } from '@ddradar/core/song'

import { getContainer } from '../cosmos'
import { SongSchema } from '../song'

/** Get a list of song information that matches the specified conditions. */
const httpTrigger: AzureFunction = async (
  context: Pick<Context, 'bindingData' | 'res'>,
  req: HttpRequest
): Promise<void> => {
  const seriesIndex =
    typeof context.bindingData.series === 'number'
      ? context.bindingData.series
      : 0 // if param is 0, passed object. (bug?)
  const nameIndex = parseFloat(req.query.name)
  const isValidName =
    Number.isInteger(nameIndex) && nameIndex >= 0 && nameIndex <= 36

  // In Azure Functions, this function will only be invoked if a valid `series` is passed.
  // So this check is only used to unit tests.
  if (
    !Number.isInteger(seriesIndex) ||
    seriesIndex < 0 ||
    seriesIndex >= SeriesList.length
  ) {
    context.res = {
      status: 404,
      body: `"series" is undefined or invalid value :${seriesIndex}`,
    }
    return
  }

  const container = getContainer('Songs', true)

  // Create SQL WHERE condition dynamically
  const column: keyof SongSchema = 'series'
  const condition: string[] = [`c.${column} = @${column}`]
  const parameters: SqlParameter[] = [
    { name: `@${column}`, value: SeriesList[seriesIndex] },
  ]
  if (isValidName) {
    const column: keyof SongSchema = 'nameIndex'
    condition.push(`c.${column} = @${column}`)
    parameters.push({ name: `@${column}`, value: nameIndex })
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
    context.res = {
      status: 404,
      body: `Not found song that {series: "${SeriesList[seriesIndex]}" nameIndex: ${nameIndex}}`,
    }
    return
  }

  context.res = {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}

export default httpTrigger
