import { Container, CosmosClient } from '@azure/cosmos'

type ContainerName = 'Courses' | 'Scores' | 'Songs' | 'Users'

/* eslint-disable node/no-process-env */
export function getConnectionString(readonly?: boolean): string | undefined {
  return readonly
    ? process.env.COSMOS_DB_CONN_READONLY || process.env.COSMOS_DB_CONN
    : process.env.COSMOS_DB_CONN
}
/* eslint-enable node/no-process-env */

let readWriteClient: CosmosClient
let readOnlyClient: CosmosClient

const readOnlyContainers: { [key: string]: Container } = {}
const readWriteContainers: { [key: string]: Container } = {}

export function getContainer(id: ContainerName, readonly?: boolean): Container {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  if (readonly && !readOnlyClient)
    readOnlyClient = new CosmosClient(getConnectionString(true)!)
  else if (!readWriteClient)
    readWriteClient = new CosmosClient(getConnectionString()!)
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  const client = readonly ? readOnlyClient : readWriteClient
  const containers = readonly ? readOnlyContainers : readWriteContainers
  if (containers[id] === undefined)
    containers[id] = client.database('DDRadar').container(id)
  return containers[id]
}
