import type { HttpRequest } from '@azure/functions'

import type { SongSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

type SongListData = Omit<SongSchema, 'charts'>

/** Get a list of song information that matches the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  songs: SongListData[]
): Promise<NotFoundResult | SuccessResult<SongListData[]>> {
  const name = parseFloat(req.query.name)
  const isValidName = Number.isInteger(name) && name >= 0 && name <= 36

  const body = songs.filter(s => !isValidName || s.nameIndex === name)

  if (body.length === 0) return { status: 404 }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
