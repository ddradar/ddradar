import { CosmosClient } from '@azure/cosmos'
import { classicSeries, whiteSeries } from '@ddradar/core'

import { databaseName, songContainer } from '../src/constants'

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

await run(process.env.COSMOS_DB_CONN)

async function run(connectionString: string | undefined) {
  if (!connectionString) return

  const client = new CosmosClient(connectionString)

  const { database } = await client.databases.createIfNotExists({
    id: databaseName,
  })

  await database.containers.createIfNotExists({
    id: songContainer,
    indexingPolicy: {
      compositeIndexes: [
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
      ],
    },
    computedProperties: [
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
    ],
  } as object)
  await database.containers.createIfNotExists({
    id: 'Scores',
    partitionKey: { paths: ['/userId'] },
    indexingPolicy: {
      compositeIndexes: [
        [
          {
            path: '/score',
            order: 'descending',
          },
          {
            path: '/clearLamp',
            order: 'descending',
          },
          {
            path: '/_ts',
            order: 'ascending',
          },
        ],
      ],
    } as object,
    defaultTtl: -1,
  })
  await database.containers.createIfNotExists({
    id: 'Users',
    partitionKey: { paths: ['/id'] },
  })
  await database.containers.createIfNotExists({
    id: 'Notification',
    partitionKey: { paths: ['/sender'] },
    indexingPolicy: {
      compositeIndexes: [
        [
          {
            path: '/pinned',
            order: 'descending',
          },
          {
            path: '/timeStamp',
            order: 'descending',
          },
        ],
      ],
    } as object,
  })
  await database.containers.createIfNotExists({
    id: 'UserDetails',
    partitionKey: { paths: ['/userId'] },
  })
}
