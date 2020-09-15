import { Container, CosmosClient } from '@azure/cosmos'

// eslint-disable-next-line node/no-process-env
const connectionString = process.env.COSMOS_DB_CONN
if (!connectionString) throw new Error('COSMOS_DB_CONN is undefined.')

const client = new CosmosClient(connectionString)
const containers: { [key: string]: Container } = {}

export function getContainer(id: string): Container {
  return (
    containers[id] ??
    (containers[id] = client.database('DDRadar').container(id))
  )
}
