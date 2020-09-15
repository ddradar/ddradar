import type { Context, HttpRequest } from '@azure/functions'

import { fetchSongList, SeriesList, SongSchema } from '../db/songs'
import type { NotFoundResult, SuccessResult } from '../function'

type SongListData = Omit<SongSchema, 'charts'>

/** Get a list of song information that matches the specified conditions. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'query'>
): Promise<NotFoundResult | SuccessResult<SongListData[]>> {
  // workaround for https://github.com/Azure/azure-functions-host/issues/6055
  const seriesIndex =
    typeof context.bindingData.series === 'number'
      ? context.bindingData.series
      : 0
  const nameIndex = parseFloat(req.query.name)
  const isValidName =
    Number.isInteger(nameIndex) && nameIndex >= 0 && nameIndex <= 36

  const body = await fetchSongList(
    isValidName ? nameIndex : undefined,
    seriesIndex
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
