// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CosmosClient } = require('@azure/cosmos')

// eslint-disable-next-line node/no-process-env
const connectionString = process.env.COSMOS_DB_CONN

module.exports = async () => {
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
    },
    defaultTtl: -1,
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
    },
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
    },
  })
  await database.containers.createIfNotExists({
    id: 'UserDetails',
    partitionKey: { paths: ['/userId'] },
  })
}
