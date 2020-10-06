import type { Context } from '@azure/functions'

import type { SongSchema } from '../db/songs'
import { ErrorResult, SuccessResult } from '../function'

/** Get song and charts information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [song]: SongSchema[]
): Promise<ErrorResult<404> | SuccessResult<SongSchema>> {
  if (!song) {
    const id = bindingData.id
    return { status: 404, body: `Not found song that id: "${id}"` }
  }

  return new SuccessResult(song)
}
