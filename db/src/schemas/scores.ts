import {
  scoreRecordSchema,
  songSchema,
  stepChartSchema,
  userSchema,
} from '@ddradar/core'
import { z } from 'zod'

const _dbScoreSchema = scoreRecordSchema.omit({ flareSkill: true }).extend({
  /** [song.id]/[chart.playStyle]/[chart.difficulty]/[user.id] */
  id: z.string(),
  /** To detect schema */
  type: z.literal('score').catch('score'),
  /** Song info */
  song: songSchema.pick({
    id: true,
    name: true,
    seriesCategory: true,
    deleted: true,
  }),
  /** Step chart info */
  chart: stepChartSchema.pick({
    playStyle: true,
    difficulty: true,
    level: true,
  }),
  /** User info */
  user: userSchema.pick({ id: true, name: true, area: true, isPublic: true }),
  /** Score is in flare target or not */
  isFlareTarget: z.oboolean(),
})
/** zod schema object for {@link DBScoreSchema}. */
export const dbScoreSchema = _dbScoreSchema.refine(
  d =>
    d.id ===
    `${d.song.id}/${d.chart.playStyle}/${d.chart.difficulty}/${d.user.id}`,
  { message: 'Invalid ID', path: ['id'] }
)
/**
 * DB schema of Score record (included on "Scores" container)
 * @example
 * ```json
 * {
 *   "id": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl/1/0/some_user1",
 *   "type": "score",
 *   "song": {
 *     "id": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "name": "愛言葉",
 *     "seriesCategory": "WHITE"
 *   },
 *   "chart": {
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 3
 *   },
 *  "user": {
 *    "id": "some_user1",
 *    "name": "User1",
 *    "area": 13,
 *    "isPublic": true
 *   },
 *   "score": 1000000,
 *   "exScore": 402,
 *   "maxCombo": 122,
 *   "clearLamp": 7,
 *   "rank": "AAA",
 *   "flareRank": 10,
 *   "isFlareTarget": true
 * }
 * ```
 */
export type DBScoreSchema = z.infer<typeof dbScoreSchema>

/** zod schema object for {@link DBScoreSchemaWithCP}. */
export const dbScoreSchemaWithCP = _dbScoreSchema.extend({
  /** Calculate from `flareRank` and `chart.level` property. */
  cp_flareSkill: z.number().int().min(0).max(1500).readonly(),
})
/**
 * DB schema of Score record with computed properties. (included on "Scores" container)
 * @example
 * ```json
 * {
 *   "id": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl/1/0/some_user1",
 *   "type": "score",
 *   "song": {
 *     "id": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "name": "愛言葉",
 *     "seriesCategory": "WHITE"
 *   },
 *   "chart": {
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 3
 *   },
 *  "user": {
 *    "id": "some_user1",
 *    "name": "User1",
 *    "area": 13,
 *    "isPublic": true
 *   },
 *   "score": 1000000,
 *   "exScore": 402,
 *   "maxCombo": 122,
 *   "clearLamp": 7,
 *   "rank": "AAA",
 *   "flareRank": 10,
 *   "cp_flareSkill": 272,
 *   "isFlareTarget": true
 * }
 * ```
 */
export type DBScoreSchemaWithCP = z.infer<typeof dbScoreSchemaWithCP>
