import { CosmosClient, type ItemDefinition } from '@azure/cosmos'
import type {
  ScoreSchema,
  SongSchema,
  UserClearLampSchema,
} from '@ddradar/core'
import { difficultyMap, playStyleMap } from '@ddradar/core'
import { consola } from 'consola'
import { config } from 'dotenv'

config()

const db = 'DDRadar'
/* eslint-disable node/no-process-env */
const devClient = new CosmosClient(process.env.COSMOS_DB_CONN!)
const prodClient = new CosmosClient(process.env.COSMOS_DB_CONN_READONLY!)
/* eslint-enable node/no-process-env */

/**
 * Copy Production master data to development.
 */
async function main() {
  let res
  // Song & Course data
  const songDr = prodClient
    .database(db)
    .container('Songs')
    .items.readAll<SongSchema>()
  do {
    const log = consola.withTag('Songs')
    res = await songDr.fetchNext()
    for (const data of res.resources) {
      await devClient.database(db).container('Songs').items.upsert(data)
      log.info(
        `Upserted: ${data.name} (id: ${data.id}, series: ${data.series})`
      )
    }
  } while (res.hasMoreResults)

  // World Records
  const oldScores = (
    await devClient
      .database(db)
      .container('Scores')
      .items.query<
        Pick<
          ScoreSchema,
          'id' | 'songId' | 'playStyle' | 'difficulty' | 'score'
        >
      >({
        query:
          'SELECT c.id, c.songId, c.playStyle, c.difficulty, c.score FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: '0' }],
      })
      .fetchAll()
  ).resources
  const scoreDr = prodClient
    .database(db)
    .container('Scores')
    .items.query<ScoreSchema>({
      query: 'SELECT * FROM c WHERE c.userId = @userId',
      parameters: [{ name: '@userId', value: '0' }],
    })
  do {
    const log = consola.withTag('Scores')
    res = await scoreDr.fetchNext()
    for (const data of res.resources) {
      const old = oldScores.find(
        d =>
          d.songId === data.songId &&
          d.playStyle === data.playStyle &&
          d.difficulty === data.difficulty
      )
      if (old && old.score !== data.score) {
        await devClient
          .database(db)
          .container('Scores')
          .item(old.id!, '0')
          .patch([
            { op: 'replace', path: '/score', value: data.score },
            { op: 'replace', path: '/exScore', value: data.exScore },
            { op: 'replace', path: '/maxCombo', value: data.maxCombo },
            { op: 'replace', path: '/clearLamp', value: data.clearLamp },
            { op: 'replace', path: '/rank', value: data.rank },
          ])
        log.info(
          `Updated: ${data.songName} (playStyle: ${playStyleMap.get(data.playStyle)}, difficulty: ${difficultyMap.get(data.difficulty)})`
        )
      } else {
        await devClient.database(db).container('Scores').items.upsert(data)
        log.info(
          `Inserted: ${data.songName} (playStyle: ${playStyleMap.get(data.playStyle)}, difficulty: ${difficultyMap.get(data.difficulty)})`
        )
      }
    }
  } while (res.hasMoreResults)

  // Song Counts
  const oldCounts = (
    await devClient
      .database(db)
      .container('UserDetails')
      .items.query<
        Pick<ItemDefinition & UserClearLampSchema, 'id' | 'playStyle' | 'level'>
      >({
        query:
          'SELECT c.playStyle, c.level, c.id FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: '0' }],
      })
      .fetchAll()
  ).resources
  const countDr = prodClient
    .database(db)
    .container('UserDetails')
    .items.query<ItemDefinition & UserClearLampSchema>({
      query: 'SELECT * FROM c WHERE c.userId = @userId',
      parameters: [{ name: '@userId', value: '0' }],
    })
  do {
    const log = consola.withTag('UserDetails')
    res = await countDr.fetchNext()
    for (const data of res.resources) {
      const old = oldCounts.find(
        d => d.playStyle === data.playStyle && d.level === data.level
      )
      if (old) {
        await devClient
          .database(db)
          .container('UserDetails')
          .item(old.id!, '0')
          .patch([{ op: 'replace', path: '/count', value: data.count }])
        log.info(
          `Updated: (playStyle: ${playStyleMap.get(data.playStyle)}, level: ${data.level})`
        )
      } else {
        await devClient.database(db).container('UserDetails').items.upsert(data)
        log.info(
          `Inserted: (playStyle: ${playStyleMap.get(data.playStyle)}, level: ${data.level})`
        )
      }
    }
  } while (res.hasMoreResults)
  consola.success('Finished!')
}

// pnpm start ./copy-to-dev.ts
main().catch(e => consola.error(e))
