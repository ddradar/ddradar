import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { ScoreSchema } from '../core/db/scores'
import type {
  CourseInfoSchema,
  Difficulty,
  SongSchema,
  StepChartSchema,
} from '../core/db/songs'
import {
  calcMyGrooveRadar,
  isScore,
  isValidScore,
  mergeScore,
} from '../core/score'
import type { ItemDefinition } from '../db'
import { ErrorResult, getBindingNumber, SuccessResult } from '../function'

type SongInput = Pick<SongSchema, 'id' | 'name'> & {
  isCourse: boolean
  charts: ReadonlyArray<StepChartSchema | CourseInfoSchema>
}

type PostScoreResult = {
  httpResponse: ErrorResult<400 | 401 | 404> | SuccessResult<ScoreSchema>
  documents?: (ScoreSchema & ItemDefinition)[]
}

/** Add or update score that match the specified chart. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  songs: SongInput[],
  scores: (ScoreSchema & ItemDefinition)[]
): Promise<PostScoreResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }

  if (!isScore(req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is not Score') }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    const body = `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`
    return { httpResponse: new ErrorResult(404, body) }
  }

  const playStyle: 1 | 2 = bindingData.playStyle
  const difficulty = getBindingNumber(bindingData, 'difficulty') as Difficulty

  // Get chart info
  if (songs.length !== 1) return { httpResponse: new ErrorResult(404) }
  const song = songs[0]
  const chart = song.charts.find(
    c => c.playStyle === playStyle && c.difficulty === difficulty
  )
  if (!chart) return { httpResponse: new ErrorResult(404) }

  if (!isValidScore(chart, req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is invalid Score') }
  }

  const userScore: ScoreSchema = {
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId: song.id,
    songName: song.name,
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
  const documents: (ScoreSchema & ItemDefinition)[] = [
    {
      ...userScore,
      ...(song.isCourse
        ? {}
        : { radar: calcMyGrooveRadar(chart as StepChartSchema, userScore) }),
    },
    ...scores.filter(s => s.userId === user.id).map(s => ({ ...s, ttl: 3600 })),
  ]

  if (user.isPublic) {
    updateAreaScore('0', userScore)
    if (user.area) {
      updateAreaScore(`${user.area}`, userScore)
    }
  }

  return { httpResponse: new SuccessResult(documents[0]), documents }

  /** Add new Area Top score into documents if greater than old one. */
  function updateAreaScore(area: string, score: ScoreSchema) {
    // Get previous score
    const oldScore = scores.find(s => s.userId === area)

    const mergedScore: ScoreSchema = {
      ...mergeScore(oldScore ?? { score: 0, rank: 'E', clearLamp: 0 }, score),
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
      mergedScore.score === oldScore?.score &&
      mergedScore.clearLamp === oldScore.clearLamp &&
      mergedScore.exScore === oldScore.exScore &&
      mergedScore.maxCombo === oldScore.maxCombo &&
      mergedScore.rank === oldScore.rank
    ) {
      return
    }

    documents.push(mergedScore)
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
