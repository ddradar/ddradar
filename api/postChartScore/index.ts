import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer } from '../cosmos'
import type { ScoreSchema } from '../db'
import type { Difficulty, SongSchema, StepChartSchema } from '../db/songs'
import type {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import { isScore, isValidScore, mergeScore } from '../score'

type ChartInfo = Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'> &
  Pick<SongSchema, 'name'>

type PostScoreResult = {
  httpResponse:
    | BadRequestResult
    | NotFoundResult
    | UnauthenticatedResult
    | SuccessResult<ScoreSchema>
  userScore?: ScoreSchema
  areaScore?: ScoreSchema
  worldScore?: ScoreSchema
}

/** Add or update score that match the specified chart. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>
): Promise<PostScoreResult> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }

  const songId: string = context.bindingData.songId
  const playStyle = context.bindingData.playStyle as 1 | 2
  const difficulty =
    typeof context.bindingData.difficulty === 'number'
      ? (context.bindingData.difficulty as Difficulty)
      : 0 // if param is 0, passed object. (bug?)

  // In Azure Functions, this function will only be invoked if a valid route.
  // So this check is only used to unit tests.
  if (!isValidRoute()) {
    return { httpResponse: { status: 404 } }
  }

  if (!isScore(req.body)) {
    return { httpResponse: { status: 400, body: 'body is not Score' } }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    return {
      httpResponse: {
        status: 404,
        body: `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`,
      },
    }
  }

  // Get chart info
  const container = getContainer('Songs', true)
  const { resources: charts } = await container.items
    .query<ChartInfo>({
      query:
        'SELECT s.name, c.notes, c.freezeArrow, c.shockArrow ' +
        'FROM s JOIN c IN s.charts ' +
        'WHERE s.id = @songId AND c.playStyle = @playStyle AND c.difficulty = @difficulty',
      parameters: [
        { name: '@songId', value: songId },
        { name: '@playStyle', value: playStyle },
        { name: '@difficulty', value: difficulty },
      ],
    })
    .fetchAll()

  if (charts.length === 0) return { httpResponse: { status: 404 } }

  if (!isValidScore(charts[0], req.body)) {
    return { httpResponse: { status: 400, body: 'body is invalid Score' } }
  }

  const userScore = createScoreSchema()

  const result: PostScoreResult = {
    httpResponse: {
      status: 200,
      headers: { 'Content-type': 'application/json' },
      body: userScore,
    },
    userScore,
  }

  if (user.isPublic) {
    const worldScore = await fetchUpdatedAreaScore('0', userScore)
    if (worldScore) result.worldScore = worldScore
    if (user.area) {
      const areaScore = await fetchUpdatedAreaScore(`${user.area}`, userScore)
      if (areaScore) result.areaScore = areaScore
    }
  }

  return result

  function isValidRoute() {
    return (
      /^[01689bdiloqDIOPQ]{32}$/.test(songId) &&
      (playStyle === 1 || playStyle === 2) &&
      [0, 1, 2, 3, 4].includes(difficulty)
    )
  }

  /**
   * Create ScoreSchema from req.body and User.
   * Also complement exScore and maxCombo.
   */
  function createScoreSchema() {
    /* eslint-disable @typescript-eslint/no-non-null-assertion -- user is not null if this function called */
    const score: ScoreSchema = {
      id: `${user!.id}-${songId}-${playStyle}-${difficulty}`,
      userId: user!.id,
      userName: user!.name,
      isPublic: user!.isPublic,
      songId,
      songName: charts[0].name,
      playStyle,
      difficulty,
      score: req.body.score,
      clearLamp: req.body.clearLamp,
      rank: req.body.rank,
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    if (req.body.exScore) {
      score.exScore = req.body.exScore
    }
    if (req.body.clearLamp === 7) {
      score.exScore =
        (charts[0].notes + charts[0].freezeArrow + charts[0].shockArrow) * 3
    }
    if (req.body.maxCombo) {
      score.maxCombo = req.body.maxCombo
    }
    if (req.body.clearLamp >= 4) {
      score.maxCombo = charts[0].notes + charts[0].shockArrow
    }
    return score
  }

  /** Return new Area Top score if greater than old one. otherwize, return `null`. */
  async function fetchUpdatedAreaScore(
    area: string,
    score: ScoreSchema
  ): Promise<ScoreSchema | null> {
    const container = getContainer('Scores', true)

    // Get previous score
    const id = `${area}-${score.songId}-${score.playStyle}-${score.difficulty}`
    const { resources } = await container.items
      .query<ScoreSchema>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll()
    const oldScore = resources[0] ?? {
      score: 0,
      rank: 'E',
      clearLamp: 0,
    }

    const mergedScore = {
      ...mergeScore(oldScore, score),
      id,
      userId: area,
      userName: area,
      isPublic: false,
      songId: score.songId,
      songName: score.songName,
      playStyle: score.playStyle,
      difficulty: score.difficulty,
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
