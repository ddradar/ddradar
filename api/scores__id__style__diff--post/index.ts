import type { ItemDefinition } from '@azure/cosmos'
import type { Context, HttpRequest } from '@azure/functions'
import { Database, Score } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, getBindingNumber, SuccessResult } from '../function'

type ScoreSchema = Database.ScoreSchema & ItemDefinition

/** Song or Course info */
type SongInput = Pick<Database.SongSchema, 'id' | 'name' | 'deleted'> & {
  charts: ReadonlyArray<Chart>
}
/** Song or Course chart info */
type Chart = Database.StepChartSchema | Database.CourseChartSchema

/** Return type of this function */
type PostScoreResult = {
  /** HTTP output binding */
  httpResponse: ErrorResult<400 | 404> | SuccessResult<Database.ScoreSchema>
  /** Cosmos DB output binding */
  documents?: ScoreSchema[]
}

/**
 * Add or update score that match the specified chart.
 * @description
 * - Need Authentication.
 * - `POST api/v1/scores/:id/:style/:diff`
 *   - `id`: {@link ScoreSchema.songId}
 *   - `style`: {@link ScoreSchema.playStyle}
 *   - `diff`: {@link ScoreSchema.difficulty}
 * @param bindingData URI parameters
 * @param req HTTP Request (from HTTP trigger)
 * @param song Song or Course info (from Cosmos DB input binding)
 * @param scores
 * Previous Score data that matches {@link ScoreSchema.songId songId}, {@link ScoreSchema.playStyle playStyle} and {@link ScoreSchema.difficulty difficulty}. (from Cosmos DB input binding)
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if user registration is not completed.
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
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  [song]: SongInput[],
  scores: ScoreSchema[]
): Promise<PostScoreResult> {
  const user = await getLoginUserInfo(getClientPrincipal(req))
  if (!user) {
    const body = 'User registration is not completed'
    return { httpResponse: new ErrorResult(404, body) }
  }

  if (!Score.isScore(req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is not Score') }
  }

  // Get chart info
  if (!song) return { httpResponse: new ErrorResult(404) }
  const chart = song.charts.find(
    c =>
      c.playStyle === bindingData.playStyle &&
      c.difficulty === getBindingNumber(bindingData, 'difficulty')
  )
  if (!chart) return { httpResponse: new ErrorResult(404) }

  if (!Score.isValidScore(chart, req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is invalid Score') }
  }

  const userScore = Database.createScoreSchema(song, chart, user, req.body)
  if (req.body.clearLamp === 7) {
    userScore.exScore = (chart.notes + chart.freezeArrow + chart.shockArrow) * 3
  }
  if (req.body.clearLamp >= 4) {
    userScore.maxCombo = chart.notes + chart.shockArrow
  }

  const documents: ScoreSchema[] = [
    userScore,
    ...scores.filter(s => s.userId === user.id).map(s => ({ ...s, ttl: 3600 })),
  ]

  if (user.isPublic) {
    updateAreaScore('0', chart, userScore)
    if (user.area) {
      updateAreaScore(`${user.area}`, chart, userScore)
    }
  }

  return { httpResponse: new SuccessResult(documents[0]), documents }

  /** Add new Area Top score into documents if greater than old one. */
  function updateAreaScore(area: string, chart: Chart, score: ScoreSchema) {
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

    documents.push(
      Database.createScoreSchema(
        song,
        chart,
        { id: area, name: area, isPublic: false },
        mergedScore
      )
    )
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
