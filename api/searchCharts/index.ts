import type { AzureFunction, Context } from '@azure/functions'

import { getContainer } from '../cosmos'
import { Chart, SongSchema } from '../song'

/** Get charts that match the specified conditions. */
const httpTrigger: AzureFunction = async (
  context: Pick<Context, 'bindingData' | 'res'>
): Promise<void> => {
  const { playStyle, level } = context.bindingData

  // In Azure Functions, this function will only be invoked if valid `playStyle` and `level` are passed.
  // So this check is only used to unit tests.
  if (playStyle !== 1 && playStyle !== 2) {
    context.res = {
      status: 404,
      body: `"playStyle" is undefined or invalid value :${playStyle}`,
    }
    return
  }
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    context.res = {
      status: 404,
      body: `"level" is undefined or invalid value :${level}`,
    }
    return
  }

  const container = getContainer('Songs', true)

  const songColumns: (keyof SongSchema)[] = ['id', 'name', 'series']
  const chartColumns: (keyof Chart)[] = ['playStyle', 'difficulty', 'level']
  const orderByColumns: (keyof SongSchema)[] = ['nameIndex', 'nameKana']
  const { resources } = await container.items
    .query<SongSchema>({
      query:
        `SELECT ${songColumns.map(col => `s.${col}`).join(', ')}, ` +
        `${chartColumns.map(col => `c.${col}`).join(', ')} ` +
        'FROM s ' +
        'JOIN c IN s.charts ' +
        'WHERE c.level = @level ' +
        'AND c.playStyle = @playStyle ' +
        `ORDER BY ${orderByColumns.map(col => `s.${col}`).join(', ')}`,
      parameters: [
        { name: '@level', value: level },
        { name: '@playStyle', value: playStyle },
      ],
    })
    .fetchAll()

  if (resources.length === 0) {
    context.res = {
      status: 404,
      body: `Not found chart that {playStyle: ${playStyle}, level: ${level}}`,
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
