import { Container, CosmosClient } from '@azure/cosmos'

type ContainerName =
  | 'Scores'
  | 'Songs'
  | 'Users'
  | 'Notification'
  | 'UserDetails'

export function getConnectionString(): string | undefined {
  // eslint-disable-next-line node/no-process-env
  return process.env.COSMOS_DB_CONN
}

let client: CosmosClient
const containers: { [key: string]: Container } = {}

export function getContainer(id: ContainerName): Container {
  if (!client) client = new CosmosClient(getConnectionString() || '')
  if (containers[id] === undefined)
    containers[id] = client.database('DDRadar').container(id)
  return containers[id]
}
