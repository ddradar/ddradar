import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ScoreSchema } from '../db/scores'
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
import { isScore, isValidScore, mergeScore, Score } from '../score'

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
  songs: SongInput[],
  scores: ScoreSchema[]
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
  if (songs.length !== 1) return { httpResponse: { status: 404 } }
  const chart = songs[0].charts.find(
    c => c.playStyle === playStyle && c.difficulty === difficulty
  )
  if (!chart) return { httpResponse: { status: 404 } }

  if (!isValidScore(chart, req.body)) {
    return { httpResponse: { status: 400, body: 'body is invalid Score' } }
  }

  const userScore: ScoreSchema = {
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId,
    songName: songs[0].name,
    playStyle,
    difficulty,
    level: chart.level,
    score: req.body.score,
    clearLamp: req.body.clearLamp,
    rank: req.body.rank,
    ...(req.body.exScore ? { exScore: req.body.exScore } : {}),
    ...(req.body.maxCombo ? { maxCombo: req.body.maxCombo } : {}),
  }
  if (req.body.clearLamp === 7) {
    userScore.exScore = (chart.notes + chart.freezeArrow + chart.shockArrow) * 3
  }
  if (req.body.clearLamp >= 4) {
    userScore.maxCombo = chart.notes + chart.shockArrow
  }
  const documents = [userScore]

  if (user.isPublic) {
    const worldScore = updateAreaScore('0', userScore)
    if (worldScore) documents.push(worldScore)
    if (user.area) {
      const areaScore = updateAreaScore(`${user.area}`, userScore)
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

  /** Return new Area Top score if greater than old one. otherwize, return `null`. */
  function updateAreaScore(
    area: string,
    score: ScoreSchema
  ): ScoreSchema | null {
    // Get previous score
    const oldScore =
      scores.find(
        s =>
          s.userId === area &&
          s.songId === score.songId &&
          s.playStyle === score.playStyle &&
          s.difficulty === score.difficulty
      ) ??
      ({
        score: 0,
        rank: 'E',
        clearLamp: 0,
      } as Score)

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
