import type { OperationInput } from '@azure/cosmos'
import type { ScoreSchema } from '@ddradar/core'
import { getDanceLevel, isValidScore } from '@ddradar/core'
import { fetchList, fetchOne, getContainer } from '@ddradar/db'

import {
  postBodySchema as bodySchema,
  postRouterParamsSchema as paramSchema,
} from '~~/schemas/score'
import { getLoginUserInfo } from '~~/server/utils/auth'
import { topUser, upsertScore } from '~~/server/utils/score'

/**
 * Add or update the scores of the specified songs all at once.
 * It will be merged with the previous score.
 * @description
 * - Need Authentication.
 * - POST `api/v1/scores/[id]`
 *   - `id`: {@link SongInput.id} or skillAttackId
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if route parameters are invalid or no song.
 * - Returns `400 Bad Request` if parameter body is invalid.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```jsonc
 * // Request Body
 * [
 *   {
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "score": 1000000,
 *     "clearLamp": 7,
 *     "rank": "AAA"
 *   },
 *   {
 *     "playStyle": 1,
 *     "difficulty": 1,
 *     "score": 999990,
 *     "clearLamp": 6,
 *     "rank": "AAA",
 *     "topScore": 1000000
 *   }
 * ]
 * ```
 *
 * ```jsonc
 * // Response Body
 * [
 *   {
 *     "userId": "public_user",
 *     "userName": "AFRO",
 *     "isPublic": true,
 *     "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "songName": "愛言葉",
 *     "playStyle": 1,
 *     "difficulty": 0,
 *     "level": 3,
 *     "score": 1000000,
 *     "exScore": 402,
 *     "maxCombo": 122,
 *     "clearLamp": 7,
 *     "rank": "AAA"
 *   },
 *   {
 *     "userId": "public_user",
 *     "userName": "AFRO",
 *     "isPublic": true,
 *     "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *     "songName": "愛言葉",
 *     "playStyle": 1,
 *     "difficulty": 1,
 *     "level": 5,
 *     "score": 999990,
 *     "exScore": 617,
 *     "maxCombo": 194,
 *     "clearLamp": 6,
 *     "rank": "AAA"
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { id } = await getValidatedRouterParams(event, paramSchema.parse)
  const body = await readValidatedBody(event, bodySchema.parse)

  const user = await getLoginUserInfo(event)
  if (!user) throw createError({ statusCode: 404 })

  // Get song info
  const song = await fetchOne('Songs', ['id', 'name', 'deleted', 'charts'], {
    condition:
      '(c.id = @ OR c.skillAttackId = StringToNumber(@) OR (@ = "dll9D90dq1O09oObO66Pl8l9I9l0PbPP" AND c.id = "01lbO69qQiP691ll6DIiqPbIdd9O806o"))',
    value: id,
  })
  if (!song) throw createError({ statusCode: 404 })

  const oldScores = await fetchList('Scores', '*', [
    { condition: 'c.songId = @', value: id },
    {
      condition: 'ARRAY_CONTAINS(@, c.userId)',
      value: [user.id, '0', `${user.area}`],
    },
    { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
  ])

  const result: ScoreSchema[] = []
  const operations: OperationInput[] = []
  for (let i = 0; i < body.length; i++) {
    const score = body[i]

    const chart = song.charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) throw createError({ statusCode: 404 })

    const chartInfo = { ...song, ...chart }
    if (!isValidScore(chartInfo, score)) {
      throw createError({
        statusCode: 400,
        message: `body[${i}] is invalid Score`,
      })
    }

    upsertScore(chartInfo, user, oldScores, score, result, operations)

    // World Record
    if (score.topScore) {
      const topScore = {
        playStyle: score.playStyle,
        difficulty: score.difficulty,
        score: score.topScore,
        clearLamp: 2 as const,
        rank: getDanceLevel(score.topScore),
      }
      upsertScore(chartInfo, topUser, oldScores, topScore, result, operations)
    } else if (user.isPublic) {
      upsertScore(chartInfo, topUser, oldScores, score, result, operations)
    }

    // Area Top
    if (user.isPublic && user.area !== 0) {
      const areaUser = {
        id: `${user.area}`,
        name: `${user.area}`,
        isPublic: false,
      }
      upsertScore(chartInfo, areaUser, oldScores, score, result, operations)
    }
  }

  await getContainer('Scores').items.batch(operations)
  return result
})
