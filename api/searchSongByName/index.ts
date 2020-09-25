import type { HttpRequest } from '@azure/functions'

import { SeriesList, SongSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

type SongListData = Omit<SongSchema, 'charts'>

/** Get a list of song information that matches the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  songs: SongListData[]
): Promise<NotFoundResult | SuccessResult<SongListData[]>> {
  const series = parseFloat(req.query.series)

  const isValidSeries =
    Number.isInteger(series) && series >= 0 && series < SeriesList.length

  const body = songs.filter(
    s => !isValidSeries || s.series === SeriesList[series]
  )

  if (body.length === 0) return { status: 404 }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
