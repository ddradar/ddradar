import { OperationInput, PatchOperationInput } from '@azure/cosmos'
import { Database, Score, Song } from '@ddradar/core'
import { fetchJoinedList, fetchList, getContainer } from '@ddradar/db'
import type { CompatibilityEvent } from 'h3'
import { useBody } from 'h3'

import { getLoginUserInfo } from '~/server/auth'
import { sendNullWithError } from '~/server/utils'

type SongChartInfo = Pick<Database.SongSchema, 'id' | 'name' | 'deleted'> &
  (Database.StepChartSchema | Database.CourseChartSchema)

/**
 * Add or update score that match the specified chart.
 * @description
 * - Need Authentication.
 * - POST `api/v1/scores/[id]/[style]/[diff]`
 *   - `id`: {@link ScoreSchema.songId}
 *   - `style`: {@link ScoreSchema.playStyle}
 *   - `diff`: {@link ScoreSchema.difficulty}
 * @param event HTTP Event
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
export default async (event: CompatibilityEvent) => {
  // route params
  const id: string = event.context.params.id
  const style = parseFloat(event.context.params.style)
  const diff = parseFloat(event.context.params.diff)
  if (
    !Song.isValidSongId(id) ||
    !Song.isPlayStyle(style) ||
    !Song.isDifficulty(diff)
  ) {
    return sendNullWithError(event, 404)
  }

  // body
  const body = await useBody(event)
  if (!Score.isScore(body)) {
    return sendNullWithError(event, 400, 'body is not Score')
  }

  const user = await getLoginUserInfo(event)
  if (!user) return sendNullWithError(event, 401)

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
      'i.stream',
      'i.voltage',
      'i.air',
      'i.freeze',
      'i.chaos',
    ],
    'charts',
    [
      { condition: 'c.id = @', value: id },
      { condition: 'i.playStyle = @', value: style },
      { condition: 'i.difficulty = @', value: diff },
    ],
    { id: 'ASC' }
  )
  if (!chart) return sendNullWithError(event, 404)

  if (!Score.isValidScore(chart, body)) {
    return sendNullWithError(event, 400, 'body is invalid Score')
  }

  const scores = await fetchList('Scores', '*', [
    { condition: 'c.songId = @', value: id },
    { condition: 'c.playStyle = @', value: style },
    { condition: 'c.difficulty = @', value: diff },
    {
      condition: 'ARRAY_CONTAINS(@, c.userId)',
      value: [user.id, '0', `${user.area}`],
    },
    { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
  ])

  const userScore = Database.createScoreSchema(chart, user, body)

  const operations: OperationInput[] = [
    { operationType: 'Create', resourceBody: userScore },
    ...scores
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
    score: Database.ScoreSchema
  ) {
    // Get previous score
    const oldScore = scores.find(s => s.userId === area)

    const mergedScore = Score.mergeScore(
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
      resourceBody: Database.createScoreSchema(
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
}
