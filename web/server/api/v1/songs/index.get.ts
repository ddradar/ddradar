import { seriesSet, type SongSchema, songSchema } from '@ddradar/core'
import { type Condition, fetchList } from '@ddradar/db'
import { z } from 'zod'

export type SongListData = Omit<SongSchema, 'skillAttackId' | 'charts'>

const maxSeriesIndex = seriesSet.size
const seriesNames = [...seriesSet]

/** Expected queries */
const schema = z.object({
  name: z.coerce
    .number()
    .pipe(songSchema.shape.nameIndex)
    .optional()
    .catch(undefined),
  series: z.coerce
    .number()
    .int()
    .min(0)
    .max(maxSeriesIndex)
    .optional()
    .catch(undefined),
})

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
export default defineEventHandler(async event => {
  const { name, series } = await getValidatedQuery(event, schema.parse)

  const conditions: Condition<'Songs'>[] = [{ condition: 'c.nameIndex >= 0' }]
  if (name !== undefined)
    conditions.push({ condition: 'c.nameIndex = @', value: name })
  if (series !== undefined)
    conditions.push({ condition: 'c.series = @', value: seriesNames[series] })

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
})
