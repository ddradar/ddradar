import { CosmosClient } from '@azure/cosmos'

export async function setup() {
  // eslint-disable-next-line node/no-process-env
  const connectionString = process.env.COSMOS_DB_CONN

  if (!connectionString) return

  const client = new CosmosClient(connectionString)

  const { database } = await client.databases.createIfNotExists({
    id: 'DDRadar',
  })

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
    throughput: 400,
  })
  await database.containers.createIfNotExists({
    id: 'Songs',
    partitionKey: { paths: ['/nameIndex'] },
    indexingPolicy: {
      compositeIndexes: [
        [
          {
            path: '/nameIndex',
            order: 'ascending',
          },
          {
            path: '/nameKana',
            order: 'ascending',
          },
        ],
      ],
    } as object,
    throughput: 400,
  })
  await database.containers.createIfNotExists({ id: 'Users', throughput: 400 })
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
    throughput: 400,
  })
  await database.containers.createIfNotExists({
    id: 'UserDetails',
    partitionKey: { paths: ['/userId'] },
    throughput: 400,
  })
}
