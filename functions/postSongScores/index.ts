import type { ItemDefinition } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import {
  Database,
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
  Score,
  Song,
} from '@ddradar/core'
import { fetchScore } from '@ddradar/db'

type ImportScoreBody = {
  password: string
  scores: Api.ScoreListBody[]
}

type SongInput = Pick<Database.SongSchema, 'id' | 'name'> & {
  charts: ReadonlyArray<Database.StepChartSchema | Database.CourseChartSchema>
}

type PostSongScoresResponse = {
  httpResponse: { status: number }
  documents?: (Database.ScoreSchema & ItemDefinition)[]
}

const topUser = { id: '0', name: '0', isPublic: false } as const

/** Add or update score that match the specified chart. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  [song]: SongInput[],
  [user]: Database.UserSchema[]
): Promise<PostSongScoresResponse> {
  if (!isValidBody(req.body)) {
    return { httpResponse: { status: 400 } }
  }

  if (user?.password !== req.body.password) {
    return { httpResponse: { status: 404 } }
  }

  // Get chart info
  if (!song) return { httpResponse: { status: 404 } }

  const documents: (Database.ScoreSchema & ItemDefinition)[] = []
  const body: Database.ScoreSchema[] = []
  for (let i = 0; i < req.body.scores.length; i++) {
    const score = req.body.scores[i]
    const chart = song.charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { httpResponse: { status: 404 } }
    if (!Score.isValidScore(chart, score)) {
      return { httpResponse: { status: 400 } }
    }

    body.push(
      Database.createScoreSchema(
        song,
        chart,
        user,
        Score.setValidScoreFromChart(chart, score)
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

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is ImportScoreBody {
    return (
      hasStringProperty(body, 'password') &&
      hasProperty(body, 'scores') &&
      Array.isArray(body.scores) &&
      body.scores.length > 0 &&
      body.scores.every(isScoreBody)
    )

    function isScoreBody(obj: unknown): obj is Api.ScoreListBody {
      return (
        Score.isScore(obj) &&
        hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
        (Song.playStyleMap as ReadonlyMap<number, string>).has(obj.playStyle) &&
        (Song.difficultyMap as ReadonlyMap<number, string>).has(
          obj.difficulty
        ) &&
        (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
      )
    }
  }

  /** Merge score is merged old one. */
  async function fetchMergedScore(
    chart: Readonly<Database.StepChartSchema | Database.CourseChartSchema>,
    user: Readonly<Pick<Database.UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Partial<Api.ScoreBody>>
  ): Promise<void> {
    // Get previous score
    const oldScore = await fetchScore(
      user.id,
      song.id,
      chart.playStyle,
      chart.difficulty
    )

    const mergedScore = Score.mergeScore(
      oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
      Score.setValidScoreFromChart(chart, score)
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

    documents.push(Database.createScoreSchema(song, chart, user, mergedScore))
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
