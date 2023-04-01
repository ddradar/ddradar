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
import { fetchList, fetchTotalChartCount } from '@ddradar/db'

const input: CosmosDBInput = {
  name: 'oldDetails',
  type: 'cosmosDB',
  direction: 'in',
  connectionStringSetting: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  collectionName: 'UserDetails',
  sqlQuery: "SELECT c.id, c.playStyle, c.level FROM c WHERE c.userId = '0'",
}
const scoreOutput: CosmosDBOutput = {
  name: 'scores',
  type: 'cosmosDB',
  direction: 'out',
  connectionStringSetting: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  collectionName: 'Scores',
}
const detailsOutput: CosmosDBOutput = {
  name: 'details',
  type: 'cosmosDB',
  direction: 'out',
  connectionStringSetting: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  collectionName: 'UserDetails',
}
app.cosmosDB('updateSongInfo', {
  connectionStringSetting: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  collectionName: 'Songs',
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
  const oldTotalCounts = ctx.extraInputs.get('') as Required<
    Omit<TotalCount, 'count' | 'userId'>
  >[]

  const scores: ScoreSchema[] = []

  for (const song of songs) {
    ctx.info(`Start: ${song.name}`)

    // Get scores
    const resources = await fetchList('Scores', '*', [
      { condition: 'c.songId = @', value: song.id },
    ])

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
          }): ${scoreText}`
        )
        ctx.warn('Make sure the chart info is correct.')
      }
      if (
        song.name !== score.songName ||
        chart.level !== score.level ||
        song.deleted !== score.deleted
      ) {
        ctx.info(`Updated: ${scoreText}`)
        const oldScore = { ...score }
        delete oldScore.deleted
        scores.push({
          ...oldScore,
          songName: song.name,
          level: chart.level,
          ...(song.deleted ? { deleted: true } : {}),
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

  const newTotalCounts = await fetchTotalChartCount()
  const details = newTotalCounts.map(r => ({
    userId: '0',
    ...r,
    id: oldTotalCounts.find(
      d => d.playStyle === r.playStyle && d.level === r.level
    )?.id,
  }))
  return { scores, details }
}
