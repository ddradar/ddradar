import type { ItemDefinition } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'
import { Api, Database, Score } from '@ddradar/core'
import { fetchScore } from '@ddradar/db'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Song or Course info */
type SongInput = Pick<Database.SongSchema, 'id' | 'name' | 'deleted'> & {
  charts: ReadonlyArray<Database.StepChartSchema | Database.CourseChartSchema>
}

/** Return type of this function */
type PostSongScoresResponse = {
  /** HTTP output binding */
  httpResponse:
    | ErrorResult<400 | 401 | 404>
    | SuccessResult<Database.ScoreSchema[]>
  /** Cosmos DB output binding */
  documents?: (Database.ScoreSchema & ItemDefinition)[]
}

const topUser = { id: '0', name: '0', isPublic: false } as const

/**
 * Add or update the scores of the specified songs all at once.
 * It will be merged with the previous score.
 * @description
 * - `POST api/v1/scores/:songId`
 * - Need Authentication.
 * @param _context Azure Functions context (unused)
 * @param req HTTP Request (from HTTP trigger)
 * @param song Song or Course info (from Cosmos DB input binding)
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if user registration is not completed.
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
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  [song]: SongInput[]
): Promise<PostSongScoresResponse> {
  const user = await getLoginUserInfo(getClientPrincipal(req))
  if (!user) {
    const body = 'User registration is not completed'
    return { httpResponse: new ErrorResult(404, body) }
  }

  if (!isValidBody(req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is not Score[]') }
  }

  // Get chart info
  if (!song) return { httpResponse: new ErrorResult(404) }

  const documents: (Database.ScoreSchema & ItemDefinition)[] = []
  const body: Database.ScoreSchema[] = []
  for (let i = 0; i < req.body.length; i++) {
    const score = req.body[i]
    const chart = song.charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { httpResponse: new ErrorResult(404) }
    if (!Score.isValidScore(chart, score)) {
      return {
        httpResponse: new ErrorResult(400, `body[${i}] is invalid Score`),
      }
    }

    body.push(
      Database.createScoreSchema(
        song,
        chart,
        user,
        Score.setValidScoreFromChart(chart, score)
      )
    )
    await updateScore(chart, user, score)

    // World Record
    if (score.topScore) {
      const topScore: Api.ScoreBody = {
        score: score.topScore,
        clearLamp: 2,
        rank: Score.getDanceLevel(score.topScore),
      }
      await updateScore(chart, topUser, topScore)
    } else if (user.isPublic) {
      await updateScore(chart, topUser, score)
    }

    // Area Top
    if (user.isPublic && user.area) {
      const area = `${user.area}`
      const areaUser = { ...topUser, id: area, name: area }
      await updateScore(chart, areaUser, score)
    }
  }

  return { httpResponse: new SuccessResult(body), documents }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is Api.ScoreListBody[] {
    return (
      Array.isArray(body) && body.length > 0 && body.every(Api.isScoreListBody)
    )
  }

  /** Create merged score and delete old one. */
  async function updateScore(
    chart: Readonly<Database.StepChartSchema | Database.CourseChartSchema>,
    user: Readonly<Pick<Database.UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Api.ScoreBody>
  ): Promise<void> {
    // Get previous score
    const oldScore = await fetchScore(
      user.id,
      song.id,
      chart.playStyle,
      chart.difficulty
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

    documents.push(Database.createScoreSchema(song, chart, user, mergedScore))
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
