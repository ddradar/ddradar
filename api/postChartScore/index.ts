import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { fetchScore, ScoreSchema } from '../db/scores'
import {
  CourseInfoSchema,
  Difficulty,
  SongSchema,
  StepChartSchema,
} from '../db/songs'
import {
  BadRequestResult,
  getBindingNumber,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import { isScore, isValidScore, mergeScore } from '../score'

type SongInput = Pick<SongSchema, 'id' | 'name'> & {
  charts: (StepChartSchema | CourseInfoSchema)[]
}

type PostScoreResult = {
  httpResponse:
    | BadRequestResult
    | NotFoundResult
    | UnauthenticatedResult
    | SuccessResult<ScoreSchema>
  documents?: ScoreSchema[]
}

/** Add or update score that match the specified chart. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  songs: SongInput[]
): Promise<PostScoreResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }

  if (!isScore(req.body)) {
    return { httpResponse: { status: 400, body: 'body is not Score' } }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    const body = `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`
    return { httpResponse: { status: 404, body } }
  }

  const songId: string = bindingData.songId
  const playStyle: 1 | 2 = bindingData.playStyle
  const difficulty = getBindingNumber(bindingData, 'difficulty') as Difficulty

  // Get chart info
  if (!songs || songs.length !== 1) return { httpResponse: { status: 404 } }
  const chart = songs[0].charts.find(
    c => c.playStyle === playStyle && c.difficulty === difficulty
  )
  if (!chart) return { httpResponse: { status: 404 } }

  if (!isValidScore(chart, req.body)) {
    return { httpResponse: { status: 400, body: 'body is invalid Score' } }
  }

  const userScore = createScoreSchema()
  const documents = [userScore]

  if (user.isPublic) {
    const worldScore = await fetchUpdatedAreaScore('0', userScore)
    if (worldScore) documents.push(worldScore)
    if (user.area) {
      const areaScore = await fetchUpdatedAreaScore(`${user.area}`, userScore)
      if (areaScore) documents.push(areaScore)
    }
  }

  return {
    httpResponse: {
      status: 200,
      headers: { 'Content-type': 'application/json' },
      body: userScore,
    },
    documents,
  }

  /**
   * Create ScoreSchema from req.body and User.
   * Also complement exScore and maxCombo.
   */
  function createScoreSchema() {
    /* eslint-disable @typescript-eslint/no-non-null-assertion -- not null if this function called */
    const score: ScoreSchema = {
      userId: user!.id,
      userName: user!.name,
      isPublic: user!.isPublic,
      songId,
      songName: songs[0].name,
      playStyle,
      difficulty,
      level: chart!.level,
      score: req.body.score,
      clearLamp: req.body.clearLamp,
      rank: req.body.rank,
    }
    if (req.body.exScore) {
      score.exScore = req.body.exScore
    }
    if (req.body.clearLamp === 7) {
      score.exScore =
        (chart!.notes + chart!.freezeArrow + chart!.shockArrow) * 3
    }
    if (req.body.maxCombo) {
      score.maxCombo = req.body.maxCombo
    }
    if (req.body.clearLamp >= 4) {
      score.maxCombo = chart!.notes + chart!.shockArrow
    }
    return score
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }

  /** Return new Area Top score if greater than old one. otherwize, return `null`. */
  async function fetchUpdatedAreaScore(
    area: string,
    score: ScoreSchema
  ): Promise<ScoreSchema | null> {
    // Get previous score
    const oldScore =
      (await fetchScore(
        area,
        score.songId,
        score.playStyle,
        score.difficulty
      )) ??
      ({
        score: 0,
        rank: 'E',
        clearLamp: 0,
      } as Pick<
        ScoreSchema,
        'score' | 'rank' | 'clearLamp' | 'exScore' | 'maxCombo'
      >)

    const mergedScore: ScoreSchema = {
      ...mergeScore(oldScore, score),
      userId: area,
      userName: area,
      isPublic: false,
      songId: score.songId,
      songName: score.songName,
      playStyle: score.playStyle,
      difficulty: score.difficulty,
      level: score.level,
    }
    if (
      mergedScore.score === oldScore.score &&
      mergedScore.clearLamp === oldScore.clearLamp &&
      mergedScore.exScore === oldScore.exScore &&
      mergedScore.maxCombo === oldScore.maxCombo &&
      mergedScore.rank === oldScore.rank
    ) {
      return null
    }
    return mergedScore
  }
}
