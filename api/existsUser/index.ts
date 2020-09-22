import type { Context } from '@azure/functions'

import type { SuccessResult } from '../function'

type ExistsUser = { id: string; exists: boolean }

/** Returns whether the specified user exists. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: unknown[]
): Promise<SuccessResult<ExistsUser>> {
  const id: string = bindingData.id

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: { id, exists: !!documents.length },
  }
}
