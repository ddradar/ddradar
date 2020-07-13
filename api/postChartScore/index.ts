import type { SqlParameter } from '@azure/cosmos'
import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer } from '../cosmos'
import type { ScoreSchema, UserSchema } from '../db'
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

/** Assert obj[name] is integer and range in [start, end] */
function hasRangedIntegerProperty<K extends string>(
  obj: unknown,
  name: K,
  start: number,
  end: number
): obj is { [M in K]: number } {
  return hasIntegerProperty(obj, name) && obj[name] >= start && obj[name] <= end
}

function isPartialScore(obj: unknown): obj is Partial<Score> {
  return (
    typeof obj === 'object' &&
    !!obj &&
    (hasRangedIntegerProperty(obj, 'score', 0, 10000000) ||
      (obj as Record<string, unknown>).score === undefined) &&
    (hasRangedIntegerProperty(obj, 'clearLamp', 0, 7) ||
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

/** Add or update score that match the specified chart. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>
): Promise<
  | BadRequestResult
  | NotFoundResult
  | UnauthenticatedResult
  | SuccessResult<ScoreSchema>
> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { status: 401 }

  const songId: string = context.bindingData.songId
  const playStyle: number = context.bindingData.playStyle
  const difficulty: Difficulty =
    typeof context.bindingData.difficulty === 'number'
      ? (context.bindingData.difficulty as Difficulty)
      : 0 // if param is 0, passed object. (bug?)

  // In Azure Functions, this function will only be invoked if a valid route.
  // So this check is only used to unit tests.
  if (
    !/^[01689bdiloqDIOPQ]{32}$/.test(songId) ||
    (playStyle !== 1 && playStyle !== 2) ||
    ![0, 1, 2, 3, 4].includes(difficulty)
  ) {
    return { status: 404 }
  }

  if (!isPartialScore(req.body)) {
    return { status: 400, body: 'body is not Score' }
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

  if (charts.length === 0) return { status: 404 }

  // Completement new score
  let newScore: Score
  try {
    newScore = setValidScoreFromChart(charts[0], req.body)
  } catch (error) {
    return { status: 400, body: error.message ?? error }
  }

  if (user.isPublic) {
    // World Record
    await upsertScore(
      { id: '0', name: '0', isPublic: false },
      songId,
      charts[0].name,
      playStyle,
      difficulty,
      newScore
    )
    if (user.area) {
      // Area Top
      await upsertScore(
        { id: `${user.area}`, name: `${user.area}`, isPublic: false },
        songId,
        charts[0].name,
        playStyle,
        difficulty,
        newScore
      )
    }
  }

  const body = await upsertScore(
    user,
    songId,
    charts[0].name,
    playStyle,
    difficulty,
    newScore
  )
  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }
}

async function upsertScore(
  {
    id: userId,
    name: userName,
    isPublic,
  }: Pick<UserSchema, 'id' | 'name' | 'isPublic'>,
  songId: string,
  songName: string,
  playStyle: 1 | 2,
  difficulty: Difficulty,
  newScore: Score
): Promise<ScoreSchema> {
  const container = getContainer('Scores')

  // Get previous score
  const whereConditions: (keyof ScoreSchema)[] = [
    'userId',
    'songId',
    'playStyle',
    'difficulty',
  ]
  const parameters: SqlParameter[] = [
    { name: '@userId', value: userId },
    { name: '@songId', value: songId },
    { name: '@playStyle', value: playStyle },
    { name: '@difficulty', value: difficulty },
  ]
  const { resources } = await container.items
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

  const mergedScore = {
    ...mergeScore(oldScore, newScore),
    id: `${userId}-${songId}-${playStyle}-${difficulty}`,
    userId,
    userName,
    isPublic,
    songId,
    songName,
    playStyle,
    difficulty,
  }
  if (
    mergedScore.score === oldScore.score &&
    mergedScore.clearLamp === oldScore.clearLamp &&
    mergedScore.exScore === oldScore.exScore &&
    mergedScore.maxCombo === oldScore.maxCombo &&
    mergedScore.rank === oldScore.rank
  ) {
    return mergedScore
  }

  const { resource } = await container.items.upsert<ScoreSchema>(mergedScore)
  if (!resource) throw new Error(`Failed upsert id:${mergedScore.id}`)
  // Remove Resource property
  return {
    id: resource.id,
    userId: resource.userId,
    userName: resource.userName,
    isPublic: resource.isPublic,
    songId: resource.songId,
    songName: resource.songName,
    playStyle: resource.playStyle,
    difficulty: resource.difficulty,
    score: resource.score,
    clearLamp: resource.clearLamp,
    rank: resource.rank,
    exScore: resource.exScore,
    maxCombo: resource.maxCombo,
  }
}
