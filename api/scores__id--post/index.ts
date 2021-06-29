import type { ItemDefinition } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'
import { Api, Database, Score } from '@ddradar/core'
import { fetchScore } from '@ddradar/db'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type SongInput = Pick<Database.SongSchema, 'id' | 'name' | 'deleted'> & {
  charts: ReadonlyArray<Database.StepChartSchema | Database.CourseChartSchema>
}

type PostSongScoresResponse = {
  httpResponse:
    | ErrorResult<400 | 401 | 404>
    | SuccessResult<Database.ScoreSchema[]>
  documents?: (Database.ScoreSchema & ItemDefinition)[]
}

const topUser = { id: '0', name: '0', isPublic: false } as const

/** Assert request body is valid schema. */
function isValidBody(body: unknown): body is Api.ScoreListBody[] {
  return (
    Array.isArray(body) && body.length > 0 && body.every(Api.isScoreListBody)
  )
}

/** Add or update score that match the specified chart. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  [song]: SongInput[]
): Promise<PostSongScoresResponse> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }

  if (!isValidBody(req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is not Score[]') }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    const body = `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`
    return { httpResponse: new ErrorResult(404, body) }
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
    await fetchMergedScore(chart, user, score)

    // World Record
    if (score.topScore) {
      const topScore: Api.ScoreBody = {
        score: score.topScore,
        clearLamp: 2,
        rank: Score.getDanceLevel(score.topScore),
      }
      await fetchMergedScore(chart, topUser, topScore)
    } else if (user.isPublic) {
      await fetchMergedScore(chart, topUser, score)
    }

    // Area Top
    if (user.isPublic && user.area) {
      const area = `${user.area}`
      const areaUser = { ...topUser, id: area, name: area }
      await fetchMergedScore(chart, areaUser, score)
    }
  }

  return { httpResponse: new SuccessResult(body), documents }

  /** Merge score is merged old one. */
  async function fetchMergedScore(
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
