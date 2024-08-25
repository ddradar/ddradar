import type { CosmosDBOutput, InvocationContext } from '@azure/functions'
import { app } from '@azure/functions'
import { detectCategory, Lamp } from '@ddradar/core'
import type { DBScoreSchema, DBSongSchema } from '@ddradar/db'
import { databaseName, scoreContainer, songContainer } from '@ddradar/db'

import { connection } from '../constants.js'
import { getClient } from '../cosmos.js'

const functionName = 'updateSongInfo'
type TriggerOutputs = {
  scores: DBScoreSchema[]
}

const scoreOutput: CosmosDBOutput = {
  name: 'scores',
  type: 'cosmosDB',
  direction: 'out',
  connection,
  databaseName,
  containerName: scoreContainer,
}
app.cosmosDB(functionName, {
  connection,
  databaseName,
  containerName: songContainer,
  leaseCollectionPrefix: functionName,
  createLeaseCollectionIfNotExists: true,
  extraOutputs: [scoreOutput],
  handler,
})

/**
 * Update song info of other container.
 * @param documents Change feed of "SongsV2" container
 * @param ctx Function context
 */
export async function handler(
  documents: unknown[],
  ctx: InvocationContext
): Promise<TriggerOutputs> {
  const scores: DBScoreSchema[] = []

  for (const song of documents as DBSongSchema[]) {
    ctx.debug(`Start: ${song.name}`)
    const worldRecordIds = new Set<string>()

    // Get exists scores
    for await (const { resources } of getClient()
      .database(databaseName)
      .container(scoreContainer)
      .items.query<DBScoreSchema>({
        query: `SELECT * FROM c WHERE c.song.id = @id`,
        parameters: [{ name: '@id', value: song.id }],
      })
      .getAsyncIterator()) {
      // Update song & chart info
      scores.push(
        ...resources.map(d => {
          // Detect world record
          if (d.user.id === '0') worldRecordIds.add(d.id)

          ctx.debug(`Update: ${d.id}`)
          return {
            ...d,
            song: {
              id: song.id,
              name: song.name,
              seriesCategory: detectCategory(song.series),
              deleted: song.deleted,
            },
            chart: {
              playStyle: d.chart.playStyle,
              difficulty: d.chart.difficulty,
              level: song.charts.find(
                c =>
                  c.playStyle === d.chart.playStyle &&
                  c.difficulty === d.chart.difficulty
              )!.level,
            },
          }
        })
      )
    }

    // Create world record if not exists
    scores.push(
      ...song.charts
        .filter(
          c =>
            !worldRecordIds.has(`${song.id}/${c.playStyle}/${c.difficulty}/0`)
        )
        .map<DBScoreSchema>(c => {
          ctx.debug(`Create: ${song.id}/${c.playStyle}/${c.difficulty}/0`)
          return {
            id: `${song.id}/${c.playStyle}/${c.difficulty}/0`,
            type: 'score',
            user: { id: '0', area: 0, isPublic: false, name: '0' },
            song: {
              id: song.id,
              name: song.name,
              seriesCategory: detectCategory(song.series),
              deleted: song.deleted,
            },
            chart: {
              playStyle: c.playStyle,
              difficulty: c.difficulty,
              level: c.level,
            },
            score: 0,
            rank: 'E',
            clearLamp: Lamp.Failed,
          }
        })
    )
    ctx.debug(`Finished: ${song.name}`)
  }
  return { scores }
}
