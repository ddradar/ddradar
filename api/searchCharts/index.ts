import type { Context } from '@azure/functions'

import type { SongSchema, StepChartSchema } from '../db/songs'
import { NotFoundResult, SuccessResult } from '../function'

type ChartListData = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

/** Get charts that match the specified conditions. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: ChartListData[]
): Promise<NotFoundResult | SuccessResult<ChartListData[]>> {
  if (documents.length === 0) {
    const message = `Not found chart that {playStyle: ${bindingData.playStyle}, level: ${bindingData.level}}`
    return { status: 404, body: message }
  }
  return new SuccessResult(documents)
}
