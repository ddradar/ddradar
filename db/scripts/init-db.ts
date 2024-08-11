import type { Resource } from '@azure/cosmos'
import { CosmosClient } from '@azure/cosmos'
import { classicSeries, whiteSeries } from '@ddradar/core'
import consola from 'consola'

import {
  databaseName,
  notificationContainer,
  scoreContainer,
  songContainer,
  userDataContainer,
} from '../src/constants'
import type { DBNotificationSchema } from '../src/schemas/notification'
import type { DBScoreSchema } from '../src/schemas/scores'
import type { DBSongSchemaWithCP } from '../src/schemas/songs'
import type { DBUserSchema } from '../src/schemas/userData'
import type { ContainerPath } from '../src/utils'

const connectionString = process.env.COSMOS_DB_CONN

/** For create {@link DBSongSchemaWithCP.cp_nameIndex} property query */
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

async function run() {
  if (!connectionString) {
    consola.error('Environment variable "COSMOS_DB_CONN" is required.')
    return
  }

  const client = new CosmosClient(connectionString)

  const { database } = await client.databases.createIfNotExists({
    id: databaseName,
  })

  await Promise.all([
    database.containers.createIfNotExists({
      id: songContainer,
      partitionKey: {
        paths: ['/type'] satisfies ContainerPath<DBSongSchemaWithCP>[],
      },
      indexingPolicy: {
        compositeIndexes: [
          [
            {
              path: '/cp_nameIndex' satisfies ContainerPath<DBSongSchemaWithCP>,
              order: 'ascending',
            },
            {
              path: '/nameKana' satisfies ContainerPath<DBSongSchemaWithCP>,
              order: 'ascending',
            },
          ],
        ],
      },
      computedProperties: [
        {
          name: 'cp_nameIndex' satisfies keyof DBSongSchemaWithCP,
          query: `SELECT VALUE ${nameIndexQueries.map((s, i) => `RegexMatch(c.nameKana, "^[${s}]") ? ${i}`).join(' : ')} : 36 FROM c`,
        },
        {
          name: 'cp_seriesCategory' satisfies keyof DBSongSchemaWithCP,
          query:
            'SELECT VALUE ' +
            `ARRAY_CONTAINS([${[...classicSeries].map(s => `"${s}"`).join(', ')}], c.series) ? "CLASSIC" ` +
            `  : ARRAY_CONTAINS([${[...whiteSeries].map(s => `"${s}"`).join(', ')}], c.series) ? "WHITE" ` +
            '    : "GOLD" ' +
            'FROM c',
        },
        {
          name: 'cp_folders' satisfies keyof DBSongSchemaWithCP,
          query:
            'SELECT VALUE ARRAY_CONCAT([{ type: "category", name: c.cp_seriesCategory }], c.folders) FROM c',
        },
      ],
    } as object),
    database.containers.createIfNotExists({
      id: userDataContainer,
      partitionKey: { paths: ['/uid'] satisfies ContainerPath<DBUserSchema>[] },
    }),
    database.containers.createIfNotExists({
      id: scoreContainer,
      partitionKey: {
        paths: ['/song/id'] satisfies ContainerPath<DBScoreSchema>[],
      },
      indexingPolicy: {
        compositeIndexes: [
          [
            {
              path: '/score' satisfies ContainerPath<DBScoreSchema>,
              order: 'descending',
            },
            {
              path: '/clearLamp' satisfies ContainerPath<DBScoreSchema>,
              order: 'descending',
            },
            {
              path: '/_ts' satisfies ContainerPath<Resource>,
              order: 'ascending',
            },
          ],
          [
            {
              path: '/flareSkill' satisfies ContainerPath<DBScoreSchema>,
              order: 'descending',
            },
            {
              path: '/_ts' satisfies ContainerPath<Resource>,
              order: 'ascending',
            },
          ],
        ],
      } as object,
    }),
    database.containers.createIfNotExists({
      id: notificationContainer,
      partitionKey: {
        paths: ['/sender'] satisfies ContainerPath<DBNotificationSchema>[],
      },
      indexingPolicy: {
        compositeIndexes: [
          [
            {
              path: '/pinned' satisfies ContainerPath<DBNotificationSchema>,
              order: 'descending',
            },
            {
              path: '/timeStamp' satisfies ContainerPath<DBNotificationSchema>,
              order: 'descending',
            },
          ],
        ],
      } as object,
    }),
  ])
}

run().catch(consola.error)
