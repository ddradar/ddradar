import type {
  CosmosDBInput,
  CosmosDBOutput,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { app } from '@azure/functions'
import type {
  CourseChartSchema,
  Score,
  ScoreSchema,
  SongSchema,
  StepChartSchema,
  UserSchema,
} from '@ddradar/core'
import {
  createScoreSchema,
  difficultyMap,
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
  isScore,
  isValidScore,
  mergeScore,
  playStyleMap,
  setValidScoreFromChart,
} from '@ddradar/core'
import { fetchScore } from '@ddradar/db'

const songInput: CosmosDBInput = {
  name: 'songs',
  type: 'cosmosDB',
  connection: 'COSMOS_DB_CONN_READONLY',
  databaseName: 'DDRadar',
  containerName: 'Songs',
  sqlQuery:
    "SELECT c.id, c.name, c.charts FROM c WHERE c.id = {songId} OR ({songId} = 'dll9D90dq1O09oObO66Pl8l9I9l0PbPP' AND c.id = '01lbO69qQiP691ll6DIiqPbIdd9O806o')",
}
const userInput: CosmosDBInput = {
  name: 'users',
  type: 'cosmosDB',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Users',
  sqlQuery: 'SELECT * FROM c WHERE c.id = {userId}',
}
const output: CosmosDBOutput = {
  name: 'documents',
  type: 'cosmosDB',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Scores',
}
app.http('postSongScores', {
  authLevel: 'anonymous',
  methods: ['POST'],
  route:
    'v1/scores/{songId:regex(^[01689bdiloqDIOPQ]{{32}}$)}/{userId:regex(^[-a-zA-Z0-9_]+$)}',
  extraInputs: [songInput, userInput],
  extraOutputs: [output],
  handler,
})

export type ScoreListBody = Pick<
  ScoreSchema,
  | 'playStyle'
  | 'difficulty'
  | 'score'
  | 'exScore'
  | 'maxCombo'
  | 'clearLamp'
  | 'rank'
> & {
  /** World Record {@link ScoreSchema.score score}. */
  topScore?: number
}

type ImportScoreBody = { password: string; scores: ScoreListBody[] }

type SongInput = Pick<SongSchema, 'id' | 'name'> & {
  charts: ReadonlyArray<StepChartSchema | CourseChartSchema>
}

const topUser = { id: '0', name: '0', isPublic: false } as const

/**
 * Add or update score that match the specified chart.
 * @param req Http request
 * @param ctx Function context
 */
export async function handler(
  req: Pick<HttpRequest, 'json'>,
  ctx: InvocationContext
): Promise<HttpResponseInit> {
  const [song] = ctx.extraInputs.get(songInput) as SongInput[]
  const [user] = ctx.extraInputs.get(userInput) as UserSchema[]
  const body = await req.json()
  if (!isValidBody(body)) return { status: 400 }

  if (user?.password !== body.password) return { status: 404 }

  // Get chart info
  if (!song) return { status: 404 }

  const documents: (ScoreSchema & { ttl?: number })[] = []
  for (let i = 0; i < body.scores.length; i++) {
    const score = body.scores[i]
    const chart = song.charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { status: 404 }
    if (!isValidScore(chart, score)) return { status: 400 }

    await fetchMergedScore(chart, user, score)

    // World Record
    if (score.topScore) {
      await fetchMergedScore(chart, topUser, {
        score: score.topScore,
        clearLamp: 2,
      })
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

  ctx.extraOutputs.set(output, documents)
  return { status: 200 }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is ImportScoreBody {
    return (
      hasStringProperty(body, 'password') &&
      hasProperty(body, 'scores') &&
      Array.isArray(body.scores) &&
      body.scores.length > 0 &&
      body.scores.every(isScoreListBody)
    )

    function isScoreListBody(obj: unknown): obj is ScoreListBody {
      return (
        isScore(obj) &&
        hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
        playStyleMap.has(obj.playStyle) &&
        difficultyMap.has(obj.difficulty) &&
        (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
      )
    }
  }

  /** Merge score is merged old one. */
  async function fetchMergedScore(
    chart: Readonly<StepChartSchema | CourseChartSchema>,
    user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Partial<Score>>
  ): Promise<void> {
    // Get previous score
    const oldScore = await fetchScore(
      user.id,
      song.id,
      chart.playStyle,
      chart.difficulty
    )

    const mergedScore = mergeScore(
      oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
      setValidScoreFromChart(chart, score)
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

    documents.push(createScoreSchema({ ...song, ...chart }, user, mergedScore))
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
