import type { Context } from '@azure/functions'

import { fetchSong, SongSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get song and charts information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<SongSchema>> {
  const id: string = context.bindingData.id

  const body = await fetchSong(id)

  if (!body) {
    return {
      status: 404,
      body: `Not found song that id: "${id}"`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
