import type { OperationInput } from '@azure/cosmos'
import { Api, Database, Score } from '@ddradar/core'
import { fetchList, fetchOne, getContainer } from '@ddradar/db'
import { readBody } from 'h3'

import { getLoginUserInfo } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

type ChartInfo = Database.StepChartSchema | Database.CourseChartSchema

const topUser = { id: '0', name: '0', isPublic: false } as const

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
  // route params
  const id: string = event.context.params!.id
  if (!Database.isValidSongId(id)) return sendNullWithError(event, 404)

  // body
  const body = await readBody(event)
  if (!isValidBody(body)) {
    return sendNullWithError(event, 400, 'body is not Score[]')
  }

  const user = await getLoginUserInfo(event)
  if (!user) return sendNullWithError(event, 401)

  // Get song info
  const song = await fetchOne('Songs', ['id', 'name', 'deleted', 'charts'], {
    condition:
      '(c.id = @ OR c.skillAttackId = StringToNumber(@) OR (@ = "dll9D90dq1O09oObO66Pl8l9I9l0PbPP" AND c.id = "01lbO69qQiP691ll6DIiqPbIdd9O806o"))',
    value: id,
  })
  if (!song) return sendNullWithError(event, 404)

  const oldScores = await fetchList('Scores', '*', [
    { condition: 'c.songId = @', value: id },
    {
      condition: 'ARRAY_CONTAINS(@, c.userId)',
      value: [user.id, '0', `${user.area}`],
    },
    { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
  ])

  const result: Database.ScoreSchema[] = []
  const operations: OperationInput[] = []
  for (let i = 0; i < body.length; i++) {
    const score = body[i]

    const chart = (song.charts as ChartInfo[]).find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return sendNullWithError(event, 404)

    if (!Score.isValidScore(chart, score)) {
      return sendNullWithError(event, 400, `body[${i}] is invalid Score`)
    }

    upsertScore(chart, user, score, true)

    // World Record
    if (score.topScore) {
      const topScore = {
        playStyle: score.playStyle,
        difficulty: score.difficulty,
        score: score.topScore,
        clearLamp: 2 as const,
        rank: Score.getDanceLevel(score.topScore),
      }
      upsertScore(chart, topUser, topScore)
    } else if (user.isPublic) {
      upsertScore(chart, topUser, score)
    }

    // Area Top
    if (user.isPublic && user.area !== 0) {
      upsertScore(
        chart,
        { id: `${user.area}`, name: `${user.area}`, isPublic: false },
        score
      )
    }
  }

  await getContainer('Scores').items.batch(operations)

  return result

  function upsertScore(
    chart: ChartInfo,
    user: Pick<Database.UserSchema, 'id' | 'name' | 'isPublic'>,
    score: Api.ScoreListBody,
    isUser = false
  ) {
    const oldScore = oldScores.find(
      d =>
        d.userId === user.id &&
        d.playStyle === chart.playStyle &&
        d.difficulty === chart.difficulty
    )
    const mergedScore = Score.mergeScore(
      oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
      Score.setValidScoreFromChart(chart, score)
    )
    if (
      mergedScore.score === oldScore?.score &&
      mergedScore.clearLamp === oldScore.clearLamp &&
      mergedScore.exScore === oldScore.exScore &&
      mergedScore.maxCombo === oldScore.maxCombo &&
      mergedScore.rank === oldScore.rank
    ) {
      return
    }
    const newScore = Database.createScoreSchema(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { ...song!, ...chart },
      user,
      mergedScore
    )
    if (isUser) result.push(newScore)

    operations.push({ operationType: 'Create', resourceBody: newScore })
    if (oldScore) {
      operations.push({
        operationType: 'Patch',
        id: oldScore.id,
        partitionKey: oldScore.userId,
        resourceBody: {
          operations: [{ op: 'add', path: '/ttl', value: 3600 }],
        },
      })
    }
  }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is Api.ScoreListBody[] {
    return (
      Array.isArray(body) && body.length > 0 && body.every(Api.isScoreListBody)
    )
  }
})
