import type { Context } from '@azure/functions'

import { fetchChartList, SongSchema, StepChartSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

type ChartListData = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

/** Get charts that match the specified conditions. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<ChartListData[]>> {
  const { playStyle, level } = context.bindingData

  const body = await fetchChartList(playStyle, level)

  if (body.length === 0) {
    return {
      status: 404,
      body: `Not found chart that {playStyle: ${playStyle}, level: ${level}}`,
    }
  }
  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
