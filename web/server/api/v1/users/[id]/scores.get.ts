import { fetchScoreList } from '@ddradar/db'

import { getScoresQuerySchema as schema } from '~~/schemas/users'

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
 *     "rank": "AAA"
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const user = await getUser(event)

  const {
    style: playStyle,
    diff: difficulty,
    level,
    lamp: clearLamp,
    rank,
  } = await getValidatedQuery(event, schema.parse)

  const conditions = { playStyle, difficulty, level, clearLamp, rank }
  return await fetchScoreList(user.id, conditions)
})
