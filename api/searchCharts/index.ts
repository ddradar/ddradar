import type { Context } from '@azure/functions'

import type { SongSchema, StepChartSchema } from '../core/db/songs'
import { ErrorResult, SuccessResult } from '../function'

type ChartListData = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

/** Get charts that match the specified conditions. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: ChartListData[]
): Promise<ErrorResult<404> | SuccessResult<ChartListData[]>> {
  if (documents.length === 0) {
    const message = `Not found chart that {playStyle: ${bindingData.playStyle}, level: ${bindingData.level}}`
    return new ErrorResult(404, message)
  }
  return new SuccessResult(documents)
}
