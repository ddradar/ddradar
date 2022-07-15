import type { Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { Condition, fetchList } from '@ddradar/db'
import { CompatibilityEvent, useQuery } from 'h3'

import { getQueryInteger } from '~/server/utils'

export type SongListData = Omit<Database.SongSchema, 'skillAttackId' | 'charts'>

const maxNameIndex = Song.nameIndexMap.size
const maxSeriesIndex = Song.seriesSet.size
const seriesNames = [...Song.seriesSet]

/**
 * Get a list of song information that matches the specified conditions.
 * @description
 * - No need Authentication.
 * - GET `/api/v1/songs?name=:name&series=:series`
 *   - `name`(optional): {@link SongListData.nameIndex}
 *   - `series`(optional): `0`: DDR 1st, `1`: DDR 2ndMIX, ..., `18`: Dance Dance Revolution A3
 * @param event HTTP Event
 * @returns
 * - Returns `404 Not Found` if no song that matches conditions.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * [
 *   {
 *     "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *     "name": "イーディーエム・ジャンパーズ",
 *     "nameKana": "いーでぃーえむ じゃんぱーず",
 *     "nameIndex": 0,
 *     "artist": "かめりあ feat. ななひら",
 *     "series": "DanceDanceRevolution A",
 *     "minBPM": 72,
 *     "maxBPM": 145
 *   }
 * ]
 * ```
 */
export default async (event: CompatibilityEvent) => {
  const query = useQuery(event)
  const nameIndex = getQueryInteger(query, 'name')
  const seriesIndex = getQueryInteger(query, 'series')

  const conditions: Condition<'Songs'>[] = [{ condition: 'c.nameIndex >= 0' }]
  if (nameIndex >= 0 && nameIndex < maxNameIndex)
    conditions.push({ condition: 'c.nameIndex = @', value: nameIndex })
  if (seriesIndex >= 0 && seriesIndex < maxSeriesIndex) {
    conditions.push({
      condition: 'c.series = @',
      value: seriesNames[seriesIndex],
    })
  }

  const songs = (await fetchList(
    'Songs',
    [
      'id',
      'name',
      'nameKana',
      'nameIndex',
      'artist',
      'series',
      'minBPM',
      'maxBPM',
      'deleted',
    ] as const,
    conditions,
    { nameIndex: 'ASC', nameKana: 'ASC' }
  )) as SongListData[]

  if (songs.length === 0) event.res.statusCode = 404

  return songs
}
