import { CosmosClient } from '@azure/cosmos'
import type { Difficulty, NameIndex, PlayStyle, Series } from '@ddradar/core'
import consola from 'consola'

import { databaseName, songContainer } from '../src/constants'
import type { DBSongSchema } from '../src/schemas/songs'

const connectionString = process.env.COSMOS_DB_CONN

/** Old Song schema */
type SongSchemaV1 = {
  id: string
  name: string
  nameKana: string
  nameIndex: NameIndex
  artist: string
  series: Series
  minBPM: number
  maxBPM: number
  charts: {
    playStyle: PlayStyle
    difficulty: Difficulty
    level: number
    notes: number
    freezeArrow: number
    shockArrow: number
    voltage: number
    stream: number
    air: number
    freeze: number
    chaos: number
  }[]
  skillAttackId?: number
  deleted?: boolean
}
/** Old Course schema */
type CourseSchemaV1 = {
  id: string
  name: string
  nameKana: string
  nameIndex: -1 | -2
}

async function run() {
  if (!connectionString) {
    consola.error('Environment variable "COSMOS_DB_CONN" is required.')
    return
  }

  const client = new CosmosClient(connectionString)

  const oldContainer = client.database(databaseName).container('Songs')
  const destContainer = client.database(databaseName).container(songContainer)

  consola.start('Migrating Song data...')
  for await (const { resources } of oldContainer.items
    .readAll<SongSchemaV1 | CourseSchemaV1>()
    .getAsyncIterator()) {
    for (const songOrCource of resources) {
      // Course data
      if (isCourseSchemaV1(songOrCource)) {
        consola.info(`Skipped Course: ${songOrCource.name}`)
        continue
      }

      // Song V1 data
      await destContainer.items.upsert<DBSongSchema>({
        id: songOrCource.id,
        type: 'song',
        name: songOrCource.name,
        nameKana: songOrCource.nameKana,
        artist: songOrCource.artist,
        series: songOrCource.series,
        minBPM: songOrCource.minBPM,
        maxBPM: songOrCource.maxBPM,
        folders: [],
        charts: songOrCource.charts.map(c => ({
          playStyle: c.playStyle,
          difficulty: c.difficulty,
          bpm: [songOrCource.minBPM, songOrCource.maxBPM, songOrCource.maxBPM],
          level: c.level,
          notes: c.notes,
          freezeArrow: c.freezeArrow,
          shockArrow: c.shockArrow,
        })),
        skillAttackId: songOrCource.skillAttackId,
        deleted: songOrCource.deleted,
      })
      consola.success(`Migrated Song: ${songOrCource.name}`)
    }
  }

  consola.success('Migration completed.')

  function isCourseSchemaV1(
    songOrCource: SongSchemaV1 | CourseSchemaV1
  ): songOrCource is CourseSchemaV1 {
    return songOrCource.nameIndex === -1 || songOrCource.nameIndex === -2
  }
}

run().catch(consola.error)
