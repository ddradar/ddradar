import type { Context, HttpRequest } from '@azure/functions'
import type { ScoreSchema, SongSchema, UserSchema } from '@ddradar/core/db'
import {
  getDanceLevel,
  isScoreRequest,
  isValidScore,
  mergeScore,
  ScoreRequest,
} from '@ddradar/core/score'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer } from '../cosmos'
import type { StepChartSchema } from '../db/songs'
import type {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import { hasIntegerProperty, hasProperty } from '../type-assert'

type ScoreBody = ScoreRequest &
  Pick<ScoreSchema, 'playStyle' | 'difficulty'> & { topScore?: number }

type ChartInfo = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level' | 'notes' | 'freezeArrow' | 'shockArrow'
> &
  Pick<SongSchema, 'id' | 'name'>

/** Add or update score that match the specified chart. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>
): Promise<
  | BadRequestResult
  | UnauthenticatedResult
  | NotFoundResult
  | SuccessResult<ScoreSchema[]>
> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { status: 401 }

  // if param is 0, passed object. (bug?)
  const songId: string =
    typeof context.bindingData.songId === 'object'
      ? '0'
      : context.bindingData.songId
  const isSkillAttackId = /^\d{1,3}$/.test(songId)

  if (!isValidBody(req.body)) {
    return { status: 400, body: 'body is not Score[]' }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    return {
      status: 404,
      body: `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`,
    }
  }

  // Get chart info
  const container = getContainer('Songs', true)
  const { resources: charts } = await container.items
    .query<ChartInfo>({
      query:
        'SELECT s.id, s.name, c.playStyle, c.difficulty, c.level, c.notes, c.freezeArrow, c.shockArrow ' +
        'FROM s JOIN c IN s.charts ' +
        `WHERE s.${isSkillAttackId ? 'skillAttackId' : 'id'} = @id`,
      parameters: [
        { name: '@id', value: isSkillAttackId ? parseInt(songId, 10) : songId },
      ],
    })
    .fetchAll()
  if (charts.length === 0) return { status: 404 }

  const topScores: ScoreSchema[] = []
  const body: ScoreSchema[] = []
  for (let i = 0; i < req.body.length; i++) {
    const score = req.body[i]
    const chart = charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { status: 404 }
    if (!isValidScore(chart, score))
      return { status: 400, body: `body[${i}] is invalid Score` }

    body.push(createSchema(chart, user, score))

    // World Record
    if (score.topScore) {
      const topScore: ScoreRequest = {
        score: score.topScore,
        clearLamp: 2,
        rank: getDanceLevel(score.topScore),
      }
      topScores.push(
        createSchema(chart, { id: '0', name: '0', isPublic: false }, topScore)
      )
    } else if (user.isPublic) {
      topScores.push(
        createSchema(chart, { id: '0', name: '0', isPublic: false }, score)
      )
    }

    // Area Top
    if (user.isPublic && user.area) {
      const area = `${user.area}`
      topScores.push(
        createSchema(chart, { id: area, name: area, isPublic: false }, score)
      )
    }
  }

  await Promise.all(body.map(s => upsertScore(s)))
  await Promise.all(topScores.map(s => upsertScore(s)))

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is ScoreBody[] {
    return (
      Array.isArray(body) && body.length > 0 && body.every(d => isScoreBody(d))
    )

    function isScoreBody(obj: unknown): obj is ScoreBody {
      return (
        isScoreRequest(obj) &&
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
    score: Readonly<ScoreRequest>
  ) {
    const scoreSchema: ScoreSchema = {
      id: `${user.id}-${chart.id}-${chart.playStyle}-${chart.difficulty}`,
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

  /** Upsert ScoreSchema. Score is merged old one. */
  async function upsertScore(score: Readonly<ScoreSchema>): Promise<void> {
    const container = getContainer('Scores')

    // Get previous score
    const { resources } = await container.items
      .query<ScoreSchema>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: score.id }],
      })
      .fetchAll()
    const oldScore = resources[0] ?? {
      score: 0,
      rank: 'E',
      clearLamp: 0,
    }

    const mergedScore = {
      ...mergeScore(oldScore, score),
      id: score.id,
      userId: score.userId,
      userName: score.userName,
      isPublic: score.isPublic,
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
      return
    }
    await container.items.upsert(mergedScore)
  }
}
