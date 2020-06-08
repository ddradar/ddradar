import { SqlParameter } from '@azure/cosmos'
import type { AzureFunction, Context, HttpRequest } from '@azure/functions'

import { SeriesList } from '../core/song'
import { getContainer } from '../cosmos'
import { SongSchema } from '../song'

/** Get a list of song information that matches the specified conditions. */
const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest
): Promise<void> => {
  const seriesIndex = parseFloat(req.query.series)
  const nameIndex = parseFloat(req.query.name)

  const isValidSeries =
    Number.isInteger(seriesIndex) &&
    seriesIndex >= 0 &&
    seriesIndex < SeriesList.length
  const isValidName =
    Number.isInteger(nameIndex) && nameIndex >= 0 && nameIndex <= 36

  if (!isValidSeries && !isValidName) {
    context.res = {
      status: 400,
      body: '"series" and "name" querys are not defined or are invalid values',
    }
    return
  }

  const container = getContainer('Songs', true)

  // Create SQL WHERE condition dynamically
  const condition: string[] = []
  const parameters: SqlParameter[] = []
  if (isValidSeries) {
    condition.push('c.series = @series ')
    parameters.push({ name: '@series', value: SeriesList[seriesIndex] })
  }
  if (isValidName) {
    condition.push('c.nameIndex = @name ')
    parameters.push({ name: '@name', value: nameIndex })
  }

  const { resources } = await container.items
    .query<SongSchema>({
      query:
        'SELECT c.id, c.name, c.nameKana, c.nameIndex, ' +
        'c.artist, c.series, c.minBPM, c.maxBPM ' +
        'FROM c ' +
        'WHERE ' +
        condition.join('AND ') +
        'ORDER BY c.nameIndex, c.nameKana',
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
