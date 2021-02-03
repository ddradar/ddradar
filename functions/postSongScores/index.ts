import type { ItemDefinition } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'
import type { ScoreBody, ScoreListBody } from '@ddradar/core/api/score'
import type { ScoreSchema } from '@ddradar/core/db/scores'
import type {
  CourseChartSchema,
  SongSchema,
  StepChartSchema,
} from '@ddradar/core/db/songs'
import { difficultyMap, playStyleMap } from '@ddradar/core/db/songs'
import type { UserSchema } from '@ddradar/core/db/users'
import {
  calcMyGrooveRadar,
  getDanceLevel,
  isScore,
  isValidScore,
  mergeScore,
} from '@ddradar/core/score'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '@ddradar/core/typeUtils'
import { fetchScore } from '@ddradar/db'

type ImportScoreBody = {
  password: string
  scores: ScoreListBody[]
}

type SongInput = Pick<SongSchema, 'id' | 'name'> & {
  isCourse: boolean
  charts: ReadonlyArray<StepChartSchema | CourseChartSchema>
}

type PostSongScoresResponse = {
  httpResponse: { status: number }
  documents?: (ScoreSchema & ItemDefinition)[]
}

const topUser = { id: '0', name: '0', isPublic: false } as const

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

  const documents: (ScoreSchema & ItemDefinition)[] = []
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

    body.push({
      ...createSchema(chart, user, score),
      ...(song.isCourse
        ? {}
        : { radar: calcMyGrooveRadar(chart as StepChartSchema, score) }),
    })
    await fetchMergedScore(chart, user, score, false)

    // World Record
    if (score.topScore) {
      const topScore: ScoreBody = {
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

  return { httpResponse: { status: 200 }, documents }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is ImportScoreBody {
    return (
      hasStringProperty(body, 'password') &&
      hasProperty(body, 'scores') &&
      Array.isArray(body.scores) &&
      body.scores.length > 0 &&
      body.scores.every(isScoreBody)
    )

    function isScoreBody(obj: unknown): obj is ScoreListBody {
      return (
        isScore(obj) &&
        hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
        (playStyleMap as ReadonlyMap<number, string>).has(obj.playStyle) &&
        (difficultyMap as ReadonlyMap<number, string>).has(obj.difficulty) &&
        (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
      )
    }
  }

  /**
   * Create ScoreSchema from chart, User and score.
   * Also complement exScore and maxCombo.
   */
  function createSchema(
    chart: Readonly<StepChartSchema | CourseChartSchema>,
    user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<ScoreBody>
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
    chart: Readonly<StepChartSchema | CourseChartSchema>,
    user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<ScoreBody>,
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
