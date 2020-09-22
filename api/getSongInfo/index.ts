import type { Context } from '@azure/functions'

import type { SongSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get song and charts information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: SongSchema[]
): Promise<NotFoundResult | SuccessResult<SongSchema>> {
  if (!documents || documents.length !== 1) {
    const id: string = bindingData.id
    return { status: 404, body: `Not found song that id: "${id}"` }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: documents[0],
  }
}
