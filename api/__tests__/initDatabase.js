/* eslint-disable node/no-process-env */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CosmosClient } = require('@azure/cosmos')

const connectionString = process.env.COSMOS_DB_CONN

async function run() {
  if (!connectionString) return

  const client = new CosmosClient(connectionString)

  const { database } = await client.databases.createIfNotExists({
    id: 'DDRadar',
  })

  await database.containers.createIfNotExists({
    id: 'Cources',
    partitionKey: { paths: ['/id'] },
  })
  await database.containers.createIfNotExists({
    id: 'Scores',
    partitionKey: { paths: ['/userId'] },
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
    partitionKey: { paths: ['/area'] },
  })
}

// eslint-disable-next-line no-console
run().catch(e => console.error(e))
