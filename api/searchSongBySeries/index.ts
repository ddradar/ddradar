import type { HttpRequest } from '@azure/functions'

import type { SongSchema } from '../db/songs'
import { ErrorResult, SuccessResult } from '../function'

type SongListData = Omit<SongSchema, 'charts'>

/** Get a list of song information that matches the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  songs: SongListData[]
): Promise<ErrorResult<404> | SuccessResult<SongListData[]>> {
  const name = parseFloat(req.query.name)
  const isValidName = Number.isInteger(name) && name >= 0 && name <= 36

  const body = songs.filter(s => !isValidName || s.nameIndex === name)

  if (body.length === 0) return new ErrorResult(404)

  return new SuccessResult(body)
}
