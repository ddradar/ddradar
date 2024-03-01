import { type ScoreSchema, scoreSchema } from '@ddradar/core'
import { fetchScoreList } from '@ddradar/db'
import { z } from 'zod'

import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'

export type ScoreList = Omit<
  ScoreSchema,
  'userId' | 'userName' | 'isPublic' | 'radar'
> & {
  /** Course score or not */
  isCourse: boolean
}

/** Expected queries */
const schema = z.object({
  style: z.coerce
    .number()
    .pipe(scoreSchema.shape.playStyle)
    .optional()
    .catch(undefined),
  diff: z.coerce
    .number()
    .pipe(scoreSchema.shape.difficulty)
    .optional()
    .catch(undefined),
  level: z.coerce
    .number()
    .pipe(scoreSchema.shape.level)
    .optional()
    .catch(undefined),
  lamp: z.coerce
    .number()
    .pipe(scoreSchema.shape.clearLamp)
    .optional()
    .catch(undefined),
  rank: z.coerce
    .string()
    .pipe(scoreSchema.shape.rank)
    .optional()
    .catch(undefined),
})

/**
 * Get user scores that match the specified conditions.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `api/v1/users/[id]/scores?style=:style&diff=:diff&level=:level&lamp=:lamp&rank=:rank`
 *   - `id`: {@link ScoreSchema.userId}
 *   - `style`(optional): {@link ScoreList.playStyle}
 *   - `diff`(optional): {@link ScoreList.difficulty}
 *   - `level`(optional): {@link ScoreList.level}
 *   - `lamp`(optional): {@link ScoreList.clearLamp}
 *   - `rank`(optional): {@link ScoreList.rank}
 * @param event HTTP Event
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "songName": "愛言葉",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 3,
 *     "score": 999950,
 *     "clearLamp": 6,
 *     "rank": "AAA",
 *     "isCourse": false
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const user = await tryFetchUser(event)
  if (!user) return sendNullWithError(event, 404)

  const {
    style: playStyle,
    diff: difficulty,
    level,
    lamp: clearLamp,
    rank,
  } = await getValidatedQuery(event, schema.parse)

  const conditions = { playStyle, difficulty, level, clearLamp, rank }
  return (await fetchScoreList(user.id, conditions)).map<ScoreList>(d => {
    const r = { ...d, isCourse: !d.radar }
    delete r.radar
    return r
  })
})
