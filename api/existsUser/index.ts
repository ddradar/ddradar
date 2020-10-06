import type { Context } from '@azure/functions'

import { SuccessResult } from '../function'

type ExistsUser = { id: string; exists: boolean }

/** Returns whether the specified user exists. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [user]: unknown[]
): Promise<SuccessResult<ExistsUser>> {
  return new SuccessResult({ id: bindingData.id, exists: !!user })
}
