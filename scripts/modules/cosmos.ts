import { Container, CosmosClient } from '@azure/cosmos'
import { config } from 'dotenv'

config()

type ContainerName =
  | 'Scores'
  | 'Songs'
  | 'Users'
  | 'Notification'
  | 'UserDetails'

/** Cosmos DB connection string */
// eslint-disable-next-line node/no-process-env
const connectionString = process.env.COSMOS_DB_CONN_READONLY || ''

let client: CosmosClient
export function getContainer(id: ContainerName): Container {
  if (!client) client = new CosmosClient(connectionString)
  return client.database('DDRadar').container(id)
}
