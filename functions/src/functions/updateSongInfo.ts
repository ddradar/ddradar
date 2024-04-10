import type {
  CosmosDBInput,
  CosmosDBOutput,
  InvocationContext,
} from '@azure/functions'
import { app } from '@azure/functions'
import type {
  CourseChartSchema,
  CourseSchema,
  ScoreSchema,
  SongSchema,
  StepChartSchema,
  UserClearLampSchema,
} from '@ddradar/core'
import { calcMyGrooveRadar } from '@ddradar/core'

import { getScores, getTotalChartCounts } from '../cosmos'

const input: CosmosDBInput = {
  name: 'oldDetails',
  type: 'cosmosDB',
  direction: 'in',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'UserDetails',
  sqlQuery: "SELECT c.id, c.playStyle, c.level FROM c WHERE c.userId = '0'",
}
const scoreOutput: CosmosDBOutput = {
  name: 'scores',
  type: 'cosmosDB',
  direction: 'out',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Scores',
}
const detailsOutput: CosmosDBOutput = {
  name: 'details',
  type: 'cosmosDB',
  direction: 'out',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'UserDetails',
}
app.cosmosDB('updateSongInfo', {
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Songs',
  leaseCollectionPrefix: 'updateSong',
  createLeaseCollectionIfNotExists: true,
  extraInputs: [input],
  extraOutputs: [scoreOutput, detailsOutput],
  handler,
})

type TotalCount = { id?: string } & Pick<
  UserClearLampSchema,
  'level' | 'playStyle' | 'count' | 'userId'
>
type UpdateSongResult = {
  scores: ScoreSchema[]
  details: TotalCount[]
}

/**
 * Update song info of other container.
 * @param documents Change feed of "Songs" container
 * @param ctx Function context
 */
export async function handler(
  documents: unknown[],
  ctx: InvocationContext
): Promise<UpdateSongResult> {
  const songs = documents as (SongSchema | CourseSchema)[]
  const oldTotalCounts = ctx.extraInputs.get(input) as Required<
    Omit<TotalCount, 'count' | 'userId'>
  >[]

  const scores: ScoreSchema[] = []

  for (const song of songs) {
    ctx.info(`Start: ${song.name}`)

    // Get scores
    const resources = await getScores(song.id)

    const topScores: ScoreSchema[] = []
    // Update exists scores
    for (const score of resources) {
      const scoreText = `{ id: ${score.id}, userId: ${score.userId}, playStyle: ${score.playStyle}, difficulty: ${score.difficulty} }`
      const chart = (
        song.charts as (StepChartSchema | CourseChartSchema)[]
      ).find(
        c =>
          c.playStyle === score.playStyle && c.difficulty === score.difficulty
      )
      if (!chart) {
        ctx.error(`Not found chart: ${scoreText}`)
        continue
      }

      if (score.userId === '0') {
        topScores.push(score)
      }

      if (
        score.clearLamp >= 4 &&
        score.maxCombo &&
        score.maxCombo !== chart.notes + chart.shockArrow
      ) {
        ctx.warn(
          `maxCombo(${score.maxCombo}) is different than expected(${
            chart.notes + chart.shockArrow
          }): ${scoreText}. Make sure the chart info is correct.`
        )
      }
      const radar = (chart as StepChartSchema).stream
        ? calcMyGrooveRadar(chart as StepChartSchema, score)
        : undefined
      if (
        song.name !== score.songName ||
        chart.level !== score.level ||
        song.deleted !== score.deleted ||
        !radarEquals(score.radar, radar)
      ) {
        ctx.info(`Updated: ${scoreText}`)
        const oldScore = { ...score }
        delete oldScore.deleted
        scores.push({
          ...oldScore,
          songName: song.name,
          level: chart.level,
          ...{ deleted: song.deleted },
          ...{ radar },
        })
      }
    }

    // Create empty score
    const emptyScore: Omit<ScoreSchema, keyof StepChartSchema> = {
      score: 0,
      clearLamp: 0,
      rank: 'E',
      userId: '0',
      userName: '0',
      isPublic: false,
      songId: song.id,
      songName: song.name,
    }
    for (const chart of song.charts) {
      if (
        !topScores.find(
          s =>
            s.playStyle === chart.playStyle && s.difficulty === chart.difficulty
        )
      ) {
        scores.push({
          ...emptyScore,
          playStyle: chart.playStyle,
          difficulty: chart.difficulty,
          level: chart.level,
          ...(song.deleted ? { deleted: true } : {}),
        })
      }
    }
  }

  const newTotalCounts = await getTotalChartCounts()
  const details = newTotalCounts.map(r => ({
    userId: '0',
    ...r,
    id: oldTotalCounts.find(
      d => d.playStyle === r.playStyle && d.level === r.level
    )?.id,
  }))
  return { scores, details }

  function radarEquals(
    left: ScoreSchema['radar'],
    right: ScoreSchema['radar']
  ) {
    if (!left && !right) return true
    if (!left || !right) return false
    return (
      left.stream === right.stream &&
      left.voltage === right.voltage &&
      left.air === right.air &&
      left.freeze === right.freeze &&
      left.chaos === right.chaos
    )
  }
}
