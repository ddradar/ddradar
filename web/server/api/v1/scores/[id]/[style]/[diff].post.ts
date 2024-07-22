import type { OperationInput, PatchOperationInput } from '@azure/cosmos'
import type { ScoreSchema, Song, StepChart } from '@ddradar/core'
import {
  createScoreSchema,
  isValidScore,
  mergeScore,
  scoreRecordSchema,
} from '@ddradar/core'
import { fetchJoinedList, fetchList, getContainer } from '@ddradar/db'

import { routerParamsSchema as paramSchema } from '~~/schemas/score'
import { getLoginUserInfo } from '~~/server/utils/auth'

type SongChartInfo = Pick<Song, 'id' | 'name' | 'deleted'> & StepChart

/**
 * Add or update score that match the specified chart.
 * @description
 * - Need Authentication.
 * - POST `api/v1/scores/[id]/[style]/[diff]`
 *   - `id`: {@link ScoreSchema.songId}
 *   - `style`: {@link ScoreSchema.playStyle}
 *   - `diff`: {@link ScoreSchema.difficulty}
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `400 Bad Request` if parameter body is invalid.
 * - Returns `404 Not Found` if route parameters are invalid or no chart.
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
  const body = await readValidatedBody(event, scoreRecordSchema.parse)

  const user = await getLoginUserInfo(event)
  if (!user) throw createError({ statusCode: 401 })

  // Get chart info
  const [chart]: SongChartInfo[] = await fetchJoinedList(
    'Songs',
    [
      'c.id',
      'c.name',
      'c.deleted',
      'i.playStyle',
      'i.difficulty',
      'i.level',
      'i.notes',
      'i.freezeArrow',
      'i.shockArrow',
    ],
    'charts',
    [
      { condition: 'c.id = @', value: id },
      { condition: 'i.playStyle = @', value: style },
      { condition: 'i.difficulty = @', value: diff },
    ],
    { id: 'ASC' }
  )
  if (!chart) throw createError({ statusCode: 404 })

  if (!isValidScore(chart, body)) {
    throw createError({ statusCode: 400, message: 'body is invalid Score' })
  }

  const oldScores = await fetchList('Scores', '*', [
    { condition: 'c.songId = @', value: id },
    { condition: 'c.playStyle = @', value: style },
    { condition: 'c.difficulty = @', value: diff },
    {
      condition: 'ARRAY_CONTAINS(@, c.userId)',
      value: [user.id, '0', `${user.area}`],
    },
    { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
  ])

  const userScore = createScoreSchema(chart, user, body)

  const operations: OperationInput[] = [
    { operationType: 'Create', resourceBody: userScore },
    ...oldScores
      .filter(d => d.userId === user.id)
      .map<PatchOperationInput>(d => ({
        operationType: 'Patch',
        id: d.id,
        partitionKey: d.userId,
        resourceBody: {
          operations: [{ op: 'add', path: '/ttl', value: 3600 }],
        },
      })),
  ]

  if (user.isPublic) {
    updateAreaScore('0', chart, userScore)
    if (user.area !== 0) {
      updateAreaScore(`${user.area}`, chart, userScore)
    }
  }

  await getContainer('Scores').items.batch(operations)

  return userScore

  /** Add new Area Top score into documents if greater than old one. */
  function updateAreaScore(
    area: string,
    chart: SongChartInfo,
    score: ScoreSchema
  ) {
    // Get previous score
    const oldScore = oldScores.find(s => s.userId === area)

    const mergedScore = mergeScore(
      oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
      score
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

    operations.push({
      operationType: 'Create',
      resourceBody: createScoreSchema(
        chart,
        { id: area, name: area, isPublic: false },
        mergedScore
      ),
    })
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
})
