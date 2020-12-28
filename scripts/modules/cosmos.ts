import { Container, CosmosClient } from '@azure/cosmos'

type ContainerName =
  | 'Scores'
  | 'Songs'
  | 'Users'
  | 'Notification'
  | 'UserDetails'

/** Cosmos DB connection string */
const connectionString = ''

let client: CosmosClient
export function getContainer(id: ContainerName): Container {
  if (!client) client = new CosmosClient(connectionString)
  return client.database('DDRadar').container(id)
}
