import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { ItemDefinition, UserSchema } from '../db'
import { fetchScore, ScoreSchema } from '../db/scores'
import type { CourseInfoSchema, SongSchema, StepChartSchema } from '../db/songs'
import type {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import {
  calcMyGrooveRadar,
  getDanceLevel,
  isScore,
  isValidScore,
  mergeScore,
  Score,
} from '../score'
import { hasIntegerProperty, hasProperty } from '../type-assert'

type ScoreBody = Score &
  Pick<ScoreSchema, 'playStyle' | 'difficulty'> & { topScore?: number }

type SongInput = Pick<SongSchema, 'id' | 'name'> & {
  isCourse: boolean
  charts: (StepChartSchema | CourseInfoSchema)[]
}

type PostSongScoresResponse = {
  httpResponse:
    | BadRequestResult
    | UnauthenticatedResult
    | NotFoundResult
    | SuccessResult<ScoreSchema[]>
  documents?: (ScoreSchema & ItemDefinition)[]
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

  const documents: (ScoreSchema & ItemDefinition)[] = []
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

    body.push({
      ...createSchema(chart, user, score),
      ...(song.isCourse
        ? {}
        : { radar: calcMyGrooveRadar(chart as StepChartSchema, score) }),
    })
    await fetchMergedScore(chart, user, score, false)

    // World Record
    if (score.topScore) {
      const topScore: Score = {
        score: score.topScore,
        clearLamp: 2,
        rank: getDanceLevel(score.topScore),
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
    chart: Readonly<StepChartSchema | CourseInfoSchema>,
    user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Score>
  ) {
    const scoreSchema: ScoreSchema = {
      userId: user.id,
      userName: user.name,
      isPublic: user.isPublic,
      songId: song.id,
      songName: song.name,
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
    chart: Readonly<StepChartSchema | CourseInfoSchema>,
    user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Score>,
    isAreaUser = true
  ): Promise<void> {
    const scoreSchema = createSchema(chart, user, score)
    // Get previous score
    const oldScore = await fetchScore(
      scoreSchema.userId,
      scoreSchema.songId,
      scoreSchema.playStyle,
      scoreSchema.difficulty
    )

    const mergedScore: ScoreSchema = {
      ...mergeScore(
        oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
        scoreSchema
      ),
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
      mergedScore.score === oldScore?.score &&
      mergedScore.clearLamp === oldScore.clearLamp &&
      mergedScore.exScore === oldScore.exScore &&
      mergedScore.maxCombo === oldScore.maxCombo &&
      mergedScore.rank === oldScore.rank
    ) {
      return
    }

    if (!isAreaUser && !song.isCourse) {
      mergedScore.radar = calcMyGrooveRadar(
        chart as StepChartSchema,
        mergedScore
      )
    }

    documents.push(mergedScore)
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
