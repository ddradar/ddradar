import type { SqlParameter } from '@azure/cosmos'
import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer } from '../cosmos'
import type { ScoreSchema } from '../db'
import { DanceLevelList } from '../db/scores'
import { Difficulty, SongSchema, StepChartSchema } from '../db/songs'
import type {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import { mergeScore, Score, setValidScoreFromChart } from '../score'
import { hasIntegerProperty, hasStringProperty } from '../type-assert'

type ChartInfo = Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'> &
  Pick<SongSchema, 'name'>
type ScoreResponse = Omit<ScoreSchema, 'id'>

function isPartialScore(obj: unknown): obj is Partial<Score> {
  return (
    ((hasIntegerProperty(obj, 'score') &&
      obj.score >= 0 &&
      obj.score <= 1000000) ||
      (obj as Record<string, unknown>).score === undefined) &&
    ((hasIntegerProperty(obj, 'clearLamp') &&
      obj.clearLamp >= 0 &&
      obj.clearLamp <= 7) ||
      (obj as Record<string, unknown>).clearLamp === undefined) &&
    (hasIntegerProperty(obj, 'exScore') ||
      (obj as Record<string, unknown>).exScore === undefined) &&
    (hasIntegerProperty(obj, 'maxCombo') ||
      (obj as Record<string, unknown>).maxCombo === undefined) &&
    ((hasStringProperty(obj, 'rank') &&
      (DanceLevelList as string[]).includes(obj.rank)) ||
      (obj as Record<string, unknown>).rank === undefined)
  )
}

/** Get course and orders information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  charts: ChartInfo[]
): Promise<
  | BadRequestResult
  | NotFoundResult
  | UnauthenticatedResult
  | SuccessResult<ScoreResponse>
> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { status: 401 }

  const songId: string = context.bindingData.songId
  const playStyle: number = context.bindingData.playStyle
  const difficulty: number =
    typeof context.bindingData.difficulty === 'number'
      ? context.bindingData.difficulty
      : 0 // if param is 0, passed object. (bug?)

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

  // In Azure Functions, this function will only be invoked if a valid route.
  // So this check is only used to unit tests.
  if (
    !/^[01689bdiloqDIOPQ]{32}$/.test(songId) ||
    (playStyle !== 1 && playStyle !== 2) ||
    ![0, 1, 2, 3, 4].includes(difficulty) ||
    charts.length === 0
  ) {
    return { status: 404 }
  }

  if (!isPartialScore(req.body)) {
    return { status: 400, body: 'body is not Score' }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) return { status: 404 }

  const scoreContainer = getContainer('Scores')

  // Get previous score
  const whereConditions: (keyof ScoreSchema)[] = [
    'userId',
    'songId',
    'playStyle',
    'difficulty',
  ]
  const parameters: SqlParameter[] = [
    { name: '@userId', value: user.id },
    { name: '@songId', value: songId },
    { name: '@playStyle', value: playStyle },
    { name: '@difficulty', value: difficulty },
  ]
  const { resources } = await scoreContainer.items
    .query<Score>({
      query:
        'SELECT * FROM c WHERE ' +
        whereConditions.map(c => `c.${c} = @${c}`).join(' AND '),
      parameters,
    })
    .fetchAll()
  const oldScore = resources[0] ?? {
    score: 0,
    rank: 'E',
    clearLamp: 0,
  }

  // Completement new score
  const newScore = setValidScoreFromChart(charts[0], req.body)

  const mergedScore: ScoreSchema = {
    ...mergeScore(oldScore, newScore),
    id: `${user.id}-${songId}-${playStyle}-${difficulty}`,
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId,
    songName: charts[0].name,
    playStyle,
    difficulty: difficulty as Difficulty,
  }

  const { resource } = await scoreContainer.items.upsert<ScoreSchema>(
    mergedScore
  )
  if (!resource) throw new Error(`Failed upsert id:${mergedScore.id}`)
  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: {
      userId: resource.userId,
      userName: resource.userName,
      isPublic: resource.isPublic,
      songId,
      songName: resource.songName,
      playStyle,
      difficulty: resource.difficulty,
      score: resource.score,
      clearLamp: resource.clearLamp,
      rank: resource.rank,
      exScore: resource.exScore,
      maxCombo: resource.maxCombo,
    },
  }
}
