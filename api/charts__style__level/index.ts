import type { Context } from '@azure/functions'

import type { ChartInfo } from '../core/api/song'
import { ErrorResult, SuccessResult } from '../function'

/** Get charts that match the specified conditions. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: ChartInfo[]
): Promise<ErrorResult<404> | SuccessResult<ChartInfo[]>> {
  if (documents.length === 0) {
    const message = `Not found chart that {playStyle: ${bindingData.playStyle}, level: ${bindingData.level}}`
    return new ErrorResult(404, message)
  }
  return new SuccessResult(documents)
}
