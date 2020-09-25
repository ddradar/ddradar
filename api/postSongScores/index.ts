import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { UserSchema } from '../db'
import { fetchScore, ScoreSchema } from '../db/scores'
import { CourseInfoSchema, SongSchema, StepChartSchema } from '../db/songs'
import {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import {
  getDanceLevel,
  isScore,
  isValidScore,
  mergeScore,
  Score,
} from '../score'
import { hasIntegerProperty, hasProperty } from '../type-assert'

type ScoreBody = Score &
  Pick<ScoreSchema, 'playStyle' | 'difficulty'> & { topScore?: number }

type ChartInfo = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level' | 'notes' | 'freezeArrow' | 'shockArrow'
> &
  Pick<SongSchema, 'id' | 'name'>

type SongInput = Pick<SongSchema, 'id' | 'name'> & {
  charts: (StepChartSchema | CourseInfoSchema)[]
}

type PostSongScoresResponse = {
  httpResponse:
    | BadRequestResult
    | UnauthenticatedResult
    | NotFoundResult
    | SuccessResult<ScoreSchema[]>
  documents?: ScoreSchema[]
}

const topUser = { id: '0', name: '0', isPublic: false } as const

/** Add or update score that match the specified chart. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  songs: SongInput[]
): Promise<PostSongScoresResponse> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }

  if (!isValidBody(req.body)) {
    return { httpResponse: { status: 400, body: 'body is not Score[]' } }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    const body = `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`
    return { httpResponse: { status: 404, body } }
  }

  // Get chart info
  if (songs.length !== 1) return { httpResponse: { status: 404 } }
  const song = songs[0]

  const documents: ScoreSchema[] = []
  const body: ScoreSchema[] = []
  for (let i = 0; i < req.body.length; i++) {
    const score = req.body[i]
    const chart = song.charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { httpResponse: { status: 404 } }
    if (!isValidScore(chart, score)) {
      return {
        httpResponse: { status: 400, body: `body[${i}] is invalid Score` },
      }
    }

    const chartInfo = { ...chart, id: song.id, name: song.name }

    body.push(createSchema(chartInfo, user, score))
    const userMergeScore = await fetchMergedScore(chartInfo, user, score)
    if (userMergeScore) documents.push(userMergeScore)

    // World Record
    if (score.topScore) {
      const topScore: Score = {
        score: score.topScore,
        clearLamp: 2,
        rank: getDanceLevel(score.topScore),
      }
      const scoreSchema = await fetchMergedScore(chartInfo, topUser, topScore)
      if (scoreSchema) documents.push(scoreSchema)
    } else if (user.isPublic) {
      const scoreSchema = await fetchMergedScore(chartInfo, topUser, score)
      if (scoreSchema) documents.push(scoreSchema)
    }

    // Area Top
    if (user.isPublic && user.area) {
      const area = `${user.area}`
      const areaUser = { ...topUser, id: area, name: area }
      const scoreSchema = await fetchMergedScore(chartInfo, areaUser, score)
      if (scoreSchema) documents.push(scoreSchema)
    }
  }

  return {
    httpResponse: {
      status: 200,
      headers: { 'Content-type': 'application/json' },
      body,
    },
    documents,
  }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is ScoreBody[] {
    return (
      Array.isArray(body) && body.length > 0 && body.every(d => isScoreBody(d))
    )

    function isScoreBody(obj: unknown): obj is ScoreBody {
      return (
        isScore(obj) &&
        hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
        [1, 2].includes(obj.playStyle) &&
        [0, 1, 2, 3, 4].includes(obj.difficulty) &&
        (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
      )
    }
  }

  /**
   * Create ScoreSchema from chart, User and score.
   * Also complement exScore and maxCombo.
   */
  function createSchema(
    chart: Readonly<ChartInfo>,
    user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Score>
  ) {
    const scoreSchema: ScoreSchema = {
      userId: user.id,
      userName: user.name,
      isPublic: user.isPublic,
      songId: chart.id,
      songName: chart.name,
      playStyle: chart.playStyle,
      difficulty: chart.difficulty,
      level: chart.level,
      score: score.score,
      clearLamp: score.clearLamp,
      rank: score.rank,
    }
    if (score.exScore) scoreSchema.exScore = score.exScore
    if (score.maxCombo) scoreSchema.maxCombo = score.maxCombo

    // calc clearLamp from score
    const baseScore =
      1000000 / (chart.notes + chart.freezeArrow + chart.shockArrow)
    if (score.score === 1000000) scoreSchema.clearLamp = 7
    // Score is greater than Gr:1
    else if (score.score > 999990 - baseScore * 0.4) scoreSchema.clearLamp = 6

    if (scoreSchema.clearLamp >= 6) {
      const exScore = (chart.notes + chart.freezeArrow + chart.shockArrow) * 3
      scoreSchema.exScore = exScore - (1000000 - score.score) / 10
    }
    if (scoreSchema.clearLamp >= 4) {
      scoreSchema.maxCombo = chart.notes + chart.shockArrow
    }
    return scoreSchema
  }

  /** Merge score is merged old one. */
  async function fetchMergedScore(
    chart: Readonly<ChartInfo>,
    user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Score>
  ): Promise<ScoreSchema | null> {
    const scoreSchema = createSchema(chart, user, score)
    // Get previous score
    const emptyScore = {
      score: 0,
      rank: 'E',
      clearLamp: 0,
      exScore: undefined,
      maxCombo: undefined,
    } as const
    const oldScore = await fetchScore(
      scoreSchema.userId,
      scoreSchema.songId,
      scoreSchema.playStyle,
      scoreSchema.difficulty
    )
    const previousScore = oldScore ?? emptyScore

    const mergedScore = {
      ...mergeScore(previousScore, scoreSchema),
      userId: scoreSchema.userId,
      userName: scoreSchema.userName,
      isPublic: scoreSchema.isPublic,
      songId: scoreSchema.songId,
      songName: scoreSchema.songName,
      playStyle: scoreSchema.playStyle,
      difficulty: scoreSchema.difficulty,
      level: scoreSchema.level,
    }
    if (
      mergedScore.score === previousScore.score &&
      mergedScore.clearLamp === previousScore.clearLamp &&
      mergedScore.exScore === previousScore.exScore &&
      mergedScore.maxCombo === previousScore.maxCombo &&
      mergedScore.rank === previousScore.rank
    ) {
      return null
    }
    return mergedScore
  }
}
