import type { Context, HttpRequest } from '@azure/functions'

import { fetchSongList, SeriesList, SongSchema } from '../db/songs'
import { getBindingData, NotFoundResult, SuccessResult } from '../function'

type SongListData = Omit<SongSchema, 'charts'>

/** Get a list of song information that matches the specified conditions. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'query'>
): Promise<NotFoundResult | SuccessResult<SongListData[]>> {
  const seriesIndex = parseFloat(req.query.series)
  const nameIndex = getBindingData(bindingData, 'name')

  const isValidSeries =
    Number.isInteger(seriesIndex) &&
    seriesIndex >= 0 &&
    seriesIndex < SeriesList.length

  // In Azure Functions, this function will only be invoked if a valid `name` is passed.
  // So this check is only used to unit tests.
  if (!Number.isInteger(nameIndex) || nameIndex < 0 || nameIndex > 36) {
    return { status: 404 }
  }

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
