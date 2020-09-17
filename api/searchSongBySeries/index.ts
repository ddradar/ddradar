import type { SqlParameter } from '@azure/cosmos'
import type { Context, HttpRequest } from '@azure/functions'
import { seriesList, SongListData } from '@ddradar/core/song'

import { getContainer } from '../cosmos'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get a list of song information that matches the specified conditions. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'query'>
): Promise<NotFoundResult | SuccessResult<SongListData[]>> {
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
    seriesIndex >= seriesList.length
  ) {
    return { status: 404 }
  }

  const container = getContainer('Songs', true)

  // Create SQL WHERE condition dynamically
  const condition: string[] = ['c.series = @series']
  const parameters: SqlParameter[] = [
    { name: '@series', value: seriesList[seriesIndex] },
  ]
  if (isValidName) {
    condition.push('c.nameIndex = @nameIndex')
    parameters.push({ name: '@nameIndex', value: nameIndex })
  } else {
    condition.push('c.nameIndex != -1')
    condition.push('c.nameIndex != -2')
  }

  const columns: (keyof SongListData)[] = [
    'id',
    'name',
    'nameKana',
    'nameIndex',
    'artist',
    'series',
    'minBPM',
    'maxBPM',
  ]
  const orderByColumns: (keyof SongListData)[] = ['nameIndex', 'nameKana']
  const { resources } = await container.items
    .query<SongListData>({
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
      body: `Not found song that {series: "${seriesList[seriesIndex]}" nameIndex: ${nameIndex}}`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
