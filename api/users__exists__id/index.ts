import type { Context } from '@azure/functions'
import type { ExistsUser } from '@ddradar/core/api/user'

import { SuccessResult } from '../function'

/** Returns whether the specified user exists. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [user]: unknown[]
): Promise<SuccessResult<ExistsUser>> {
  return new SuccessResult({ id: bindingData.id, exists: !!user })
}
