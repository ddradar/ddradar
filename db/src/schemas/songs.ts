import { songSchema } from '@ddradar/core'
import { z } from 'zod'

/** zod schema object for {@link DBSongSchema}. */
export const dbSongSchema = songSchema
  .omit({ nameIndex: true, seriesCategory: true })
  .extend({
    /**
     * To detect schema
     * @remarks This property is {@link https://learn.microsoft.com/azure/cosmos-db/partitioning-overview Partition Key}.
     */
    type: z.literal('song').catch('song'),
  })
/**
 * DB Schema of Song data (included on "Songs" container)
 * @example
 * ```json
 * {
 *   "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *   "type": "song",
 *   "name": "イーディーエム・ジャンパーズ",
 *   "nameKana": "いーでぃーえむ じゃんぱーず",
 *   "artist": "かめりあ feat. ななひら",
 *   "series": "DanceDanceRevolution A",
 *   "minBPM": 72,
 *   "maxBPM": 145,
 *   "folders": [],
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "bpm": [72, 145, 145],
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0
 *     }
 *   ],
 *   "skillAttackId": 675
 * }
 * ```
 */
export type DBSongSchema = z.infer<typeof dbSongSchema>

/** zod schema object for {@link DBSongSchema} with computed properties. */
export const songSchemaWithCP = dbSongSchema.extend({
  /**
   * Calculate from `nameKana` property.
   *
   * `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
   * @remarks This property is {@link https://learn.microsoft.com/azure/cosmos-db/nosql/query/computed-properties Computed Properties}.
   */
  cp_nameIndex: songSchema.shape.nameIndex,
  /**
   * Flare Skill category. Calculate from `series` property.
   * @remarks This property is {@link https://learn.microsoft.com/azure/cosmos-db/nosql/query/computed-properties Computed Properties}.
   */
  cp_seriesCategory: z
    .union([z.literal('CLASSIC'), z.literal('WHITE'), z.literal('GOLD')])
    .readonly(),
  /**
   * Used for filtering. Calculate from below properties.
   * - `cp_seriesCategory`: `{ type: 'category', name: <cp_seriesCategory> }`
   * - `cp_nameIndex`: `{ type: 'name', name: 'XYZ' }`
   * - `series`: `{ type: 'series', name: 'A20' }`
   * - `folders`: Includes all elements
   * @remarks This property is {@link https://learn.microsoft.com/azure/cosmos-db/nosql/query/computed-properties Computed Properties}.
   */
  cp_folders: songSchema.shape.folders,
})
/**
 * DB Schema of Song data with computed properties. (included on "Songs" container)
 * @example
 * ```json
 * {
 *   "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *   "name": "イーディーエム・ジャンパーズ",
 *   "nameKana": "いーでぃーえむ じゃんぱーず",
 *   "cp_nameIndex": 0,
 *   "artist": "かめりあ feat. ななひら",
 *   "series": "DanceDanceRevolution A",
 *   "cp_seriesCategory": "WHITE",
 *   "minBPM": 72,
 *   "maxBPM": 145,
 *   "folders": [],
 *   "cp_folders": [
 *     { "type": "category", "name": "WHITE" },
 *     { "type": "name", "name": "あ" },
 *     { "type": "series", "name": "A" }
 *   ],
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "bpm": [72, 145, 145],
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0
 *     }
 *   ],
 *   "skillAttackId": 675
 * }
 * ```
 */
export type DBSongSchemaWithCP = z.infer<typeof songSchemaWithCP>
