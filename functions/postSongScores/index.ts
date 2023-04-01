import type { HttpRequest } from '@azure/functions'
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

type ImportScoreBody = {
  password: string
  scores: ScoreListBody[]
}

type SongInput = Pick<SongSchema, 'id' | 'name'> & {
  charts: ReadonlyArray<StepChartSchema | CourseChartSchema>
}

type PostSongScoresResponse = {
  httpResponse: { status: number }
  documents?: (ScoreSchema & { ttl?: number })[]
}

const topUser = { id: '0', name: '0', isPublic: false } as const

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

/** Add or update score that match the specified chart. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  [song]: SongInput[],
  [user]: UserSchema[]
): Promise<PostSongScoresResponse> {
  if (!isValidBody(req.body)) {
    return { httpResponse: { status: 400 } }
  }

  if (user?.password !== req.body.password) {
    return { httpResponse: { status: 404 } }
  }

  // Get chart info
  if (!song) return { httpResponse: { status: 404 } }

  const documents: (ScoreSchema & { ttl?: number })[] = []
  const body: ScoreSchema[] = []
  for (let i = 0; i < req.body.scores.length; i++) {
    const score = req.body.scores[i]
    const chart = song.charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { httpResponse: { status: 404 } }
    if (!isValidScore(chart, score)) {
      return { httpResponse: { status: 400 } }
    }

    body.push(
      createScoreSchema(
        { ...song, ...chart },
        user,
        setValidScoreFromChart(chart, score)
      )
    )
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

  return { httpResponse: { status: 200 }, documents }

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
