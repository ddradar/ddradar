import {
  getQuerySchema as querySchema,
  routerParamsSchema as paramSchema,
} from '~~/schemas/scores'

/**
 * Get scores that match the specified chart.
 * @description
 * - No need Authentication. Authenticated users can get their own data even if they are private.
 * - GET `/api/v2/scores/[id]/[style]/[diff]?scope=:scope`
 *   - `scope`(optional): `private`: Only personal best score, `medium`(default): Personal best, area top, and world top scores, `full`: All scores
 *   - `id`: Song ID
 *   - `style`: PlayStyle
 *   - `diff`: Difficulty
 * @returns
 * - Returns `404 Not Found` if parameters are invalid.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```json
 * [
 *   {
 *     "userId": "0",
 *     "userName": "0",
 *     "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *     "songName": "PARANOiA",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 4,
 *     "score": 1000000,
 *     "exScore": 414,
 *     "maxCombo": 138,
 *     "clearLamp": 7,
 *     "rank": "AAA"
 *   },
 *   {
 *     "userId": "13",
 *     "userName": "13",
 *     "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *     "songName": "PARANOiA",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 4,
 *     "score": 999980,
 *     "exScore": 412,
 *     "maxCombo": 138,
 *     "clearLamp": 6,
 *     "rank": "AAA"
 *   },
 *   {
 *     "userId": "public_user",
 *     "userName": "AFRO",
 *     "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *     "songName": "PARANOiA",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 4,
 *     "score": 999950,
 *     "clearLamp": 6,
 *     "rank": "AAA",
 *     "flareRank": 10,
 *     "flareSkill": 296
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { id, style, diff } = await getValidatedRouterParams(
    event,
    paramSchema.parse
  )
  const { scope } = await getValidatedQuery(event, querySchema.parse)

  const user = await getLoginUserInfo(event).catch(() => null)
  if (scope === 'private' && !user) {
    throw createError({
      statusCode: 404,
      message: '"private" scope must be logged in',
    })
  }

  /**
   * private: `[user.id]`
   * medium, full: `[user.id, '0', user.area]`
   */
  const userIds = [
    user?.id,
    ...(scope !== 'private' ? ['0', `${user?.area ?? ''}`] : []),
  ].filter((u): u is string => !!u)

  const scores = await getScoreRepository(event).list([
    { condition: 'c.song.id = @', value: id },
    { condition: 'c.chart.playStyle = @', value: style },
    { condition: 'c.chart.difficulty = @', value: diff },
    {
      condition: `ARRAY_CONTAINS(@, c.user.id)${
        scope === 'full' ? ' OR c.user.isPublic' : ''
      }`,
      value: userIds,
    },
  ])

  return scores
})
