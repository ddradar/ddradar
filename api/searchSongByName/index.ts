import type { Context, HttpRequest } from '@azure/functions'

import { fetchSongList, SeriesList, SongSchema } from '../db/songs'
import { getBindingNumber, NotFoundResult, SuccessResult } from '../function'

type SongListData = Omit<SongSchema, 'charts'>

/** Get a list of song information that matches the specified conditions. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'query'>
): Promise<NotFoundResult | SuccessResult<SongListData[]>> {
  const seriesIndex = parseFloat(req.query.series)
  const nameIndex = getBindingNumber(bindingData, 'name')

  const isValidSeries =
    Number.isInteger(seriesIndex) &&
    seriesIndex >= 0 &&
    seriesIndex < SeriesList.length

  const body = await fetchSongList(
    nameIndex,
    isValidSeries ? seriesIndex : undefined
  )

  if (body.length === 0) {
    return {
      status: 404,
      body: `Not found song that {series: "${SeriesList[seriesIndex]}" nameIndex: ${nameIndex}}`,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}
