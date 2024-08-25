import type { UserScoreRecord } from '@ddradar/core'

import {
  postBodySchema as bodySchema,
  routerParamsSchema as paramSchema,
} from '~~/schemas/scores'

/**
 * Add or update score that match the specified chart.
 * @description
 * - Need Authentication.
 * - POST `/api/v2/scores/[id]/[style]/[diff]`
 *   - `id`: Song ID
 *   - `style`: PlayStyle
 *   - `diff`: Difficulty
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `400 Bad Request` if parameter body or route params are invalid.
 * - Returns `404 Not Found` if no song or chart.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```jsonc
 * // Request Body
 * {
 *   "score": 999950,
 *   "clearLamp": 6,
 *   "rank": "AAA"
 * }
 * ```
 *
 * ```jsonc
 * // Response Body
 * {
 *   "userId": "public_user",
 *   "userName": "AFRO",
 *   "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *   "songName": "愛言葉",
 *   "playStyle": 1,
 *   "difficulty": 0,
 *   "level": 3,
 *   "score": 999950,
 *   "clearLamp": 6,
 *   "exScore": 397,
 *   "maxCombo": 122,
 *   "rank": "AAA"
 * }
 * ```
 */
export default defineEventHandler(async event => {
  const { id, style, diff } = await getValidatedRouterParams(
    event,
    paramSchema.parse
  )
  const body = await readValidatedBody(event, bodySchema.parse)

  const user = await getLoginUserInfo(event)

  try {
    const res = await getScoreRepository(event).upsert(
      user,
      id,
      style,
      diff,
      body
    )
    return {
      userId: res.user.id,
      userName: res.user.name,
      songId: res.song.id,
      songName: res.song.name,
      playStyle: res.chart.playStyle,
      difficulty: res.chart.difficulty,
      level: res.chart.level,
      score: res.score,
      exScore: res.exScore,
      maxCombo: res.maxCombo,
      clearLamp: res.clearLamp,
      rank: res.rank,
    } satisfies UserScoreRecord
  } catch (error) {
    if (!(error instanceof Error)) throw error
    if (error.message.startsWith('Song'))
      throw createError({ statusCode: 404, message: error.message })
    throw createError({ statusCode: 400, message: error.message })
  }
})
