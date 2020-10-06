import type { HttpRequest } from '@azure/functions'

import { SeriesList, SongSchema } from '../db/songs'
import { NotFoundResult, SuccessResult } from '../function'

type SongListData = Omit<SongSchema, 'charts'>

/** Get a list of song information that matches the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  songs: SongListData[]
): Promise<NotFoundResult | SuccessResult<SongListData[]>> {
  const i = parseFloat(req.query.series)
  const isValidSeries = Number.isInteger(i) && i >= 0 && i < SeriesList.length

  const body = songs.filter(s => !isValidSeries || s.series === SeriesList[i])

  if (body.length === 0) return { status: 404 }

  return new SuccessResult(body)
}
