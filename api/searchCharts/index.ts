import type { Context } from '@azure/functions'

import { getContainer } from '../cosmos'
import type { SongSchema, StepChartSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

type Song = Omit<SongSchema, 'charts'>
type StepChart = StepChartSchema & Pick<SongSchema, 'id' | 'name' | 'series'>

/** Get charts that match the specified conditions. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<StepChart[]>> {
  const { playStyle, level } = context.bindingData

  // In Azure Functions, this function will only be invoked if valid `playStyle` and `level` are passed.
  // So this check is only used to unit tests.
  if (playStyle !== 1 && playStyle !== 2) {
    return { status: 404 }
  }
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    return { status: 404 }
  }

  const container = getContainer('Songs', true)

  const songColumns: (keyof StepChart)[] = ['id', 'name', 'series']
  const chartColumns: (keyof StepChart)[] = ['playStyle', 'difficulty', 'level']
  const orderByColumns: (keyof Song)[] = ['nameIndex', 'nameKana']
  const { resources } = await container.items
    .query<StepChart>({
      query:
        `SELECT ${songColumns.map(col => `s.${col}`).join(', ')}, ` +
        `${chartColumns.map(col => `c.${col}`).join(', ')} ` +
        'FROM s ' +
        'JOIN c IN s.charts ' +
        'WHERE s.nameIndex != -1 ' +
        'AND s.nameIndex != -2 ' +
        'AND c.level = @level ' +
        'AND c.playStyle = @playStyle ' +
        `ORDER BY ${orderByColumns.map(col => `s.${col}`).join(', ')}`,
      parameters: [
        { name: '@level', value: level },
        { name: '@playStyle', value: playStyle },
      ],
    })
    .fetchAll()

  if (resources.length === 0) {
    return {
      status: 404,
      body: `Not found chart that {playStyle: ${playStyle}, level: ${level}}`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
