import type { Context } from '@azure/functions'

import type { SongSchema, StepChartSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

type ChartListData = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

/** Get charts that match the specified conditions. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: ChartListData[]
): Promise<NotFoundResult | SuccessResult<ChartListData[]>> {
  if (documents.length === 0) {
    const { playStyle, level } = context.bindingData
    return {
      status: 404,
      body: `Not found chart that {playStyle: ${playStyle}, level: ${level}}`,
    }
  }
  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: documents,
  }
}
