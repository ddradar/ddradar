import { CosmosClient } from '@azure/cosmos'
import type { Difficulty, NameIndex, PlayStyle, Series } from '@ddradar/core'
import { classicSeries, whiteSeries } from '@ddradar/core'
import consola from 'consola'

import { databaseName, songContainer } from '../src/constants'
import type { DBSongSchema } from '../src/schemas/songs'

const connectionString = process.env.COSMOS_DB_CONN

const nameIndexQueries = [
  'ぁ-おゔ',
  'か-ごゕ-ゖ',
  'さ-ぞ',
  'た-ど',
  'な-の',
  'は-ぽ',
  'ま-も',
  'ゃ-よ',
  'ら-ろ',
  'ゎ-ん',
  'aA',
  'bB',
  'cC',
  'dD',
  'eE',
  'fF',
  'gG',
  'hH',
  'iI',
  'jJ',
  'kK',
  'lL',
  'mM',
  'nN',
  'oO',
  'pP',
  'qQ',
  'rR',
  'sS',
  'tT',
  'uU',
  'vV',
  'wW',
  'xX',
  'yY',
  'zZ',
]
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

  const container = client.database(databaseName).container(songContainer)

  // Add computed properties
  consola.start('Indexing policy and Computed properties updating...')
  const { resource } = await container.read()
  if (resource) {
    resource.indexingPolicy ??= {}
    // @ts-expect-error - Supported at next version
    resource.indexingPolicy!.compositeIndexes = [
      [
        {
          path: '/cp_nameIndex',
          order: 'ascending',
        },
        {
          path: '/nameKana',
          order: 'ascending',
        },
      ],
    ]
    // @ts-expect-error - Supported at next version
    resource.computedProperties = [
      {
        name: 'cp_nameIndex',
        query: `SELECT VALUE ${nameIndexQueries.map((s, i) => `RegexMatch(c.nameKana, "^[${s}]") ? ${i}`).join(' : ')} : 36 FROM c`,
      },
      {
        name: 'cp_seriesCategory',
        query:
          'SELECT VALUE ' +
          `ARRAY_CONTAINS([${[...classicSeries].map(s => `"${s}"`).join(', ')}], c.series) ? "CLASSIC" ` +
          `  : ARRAY_CONTAINS([${[...whiteSeries].map(s => `"${s}"`).join(', ')}], c.series) ? "WHITE" ` +
          '    : "GOLD" ' +
          'FROM c',
      },
      {
        name: 'cp_folders',
        query:
          'SELECT VALUE ARRAY_CONCAT([{ type: "category", name: c.cp_seriesCategory }], c.folders) FROM c',
      },
    ]
    const res = await container.replace(resource)
    if (res.statusCode === 200)
      consola.success('Indexing policy and Computed properties updated.')
  }

  consola.start('Migrating Song data...')
  for await (const { resources } of container.items
    .readAll<SongSchemaV1 | CourseSchemaV1 | DBSongSchema>()
    .getAsyncIterator()) {
    for (const songOrCource of resources) {
      // Skip if already migrated
      if ('type' in songOrCource) continue

      // Course data
      if (songOrCource.nameIndex === -1 || songOrCource.nameIndex === -2) {
        await container.item(songOrCource.id, songOrCource.id).delete()
        consola.success(`Deleted Course: ${songOrCource.name}`)
        continue
      }

      // Song V1 data
      const songV1 = songOrCource as SongSchemaV1
      await container.item(songV1.id).replace({
        id: songV1.id,
        type: 'song',
        name: songV1.name,
        nameKana: songV1.nameKana,
        artist: songV1.artist,
        series: songV1.series,
        minBPM: songV1.minBPM,
        maxBPM: songV1.maxBPM,
        folders: [],
        charts: songV1.charts.map(c => ({
          playStyle: c.playStyle,
          difficulty: c.difficulty,
          bpm: [songV1.minBPM, songV1.maxBPM, songV1.maxBPM],
          level: c.level,
          notes: c.notes,
          freezeArrow: c.freezeArrow,
          shockArrow: c.shockArrow,
        })),
        skillAttackId: songV1.skillAttackId,
        deleted: songV1.deleted,
      } satisfies DBSongSchema)
      consola.success(`Migrated Song: ${songV1.name}`)
    }
  }

  consola.success('Migration completed.')
}

run().catch(consola.error)
