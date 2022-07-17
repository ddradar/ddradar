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
 * @returns `200 OK` with JSON body.
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
  const name = getQueryInteger(query, 'name')
  const series = getQueryInteger(query, 'series')

  const conditions: Condition<'Songs'>[] = [{ condition: 'c.nameIndex >= 0' }]
  if (name >= 0 && name < maxNameIndex)
    conditions.push({ condition: 'c.nameIndex = @', value: name })
  if (series >= 0 && series < maxSeriesIndex) {
    conditions.push({ condition: 'c.series = @', value: seriesNames[series] })
  }

  return (await fetchList(
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
    ],
    conditions,
    { nameIndex: 'ASC', nameKana: 'ASC' }
  )) as SongListData[]
}
