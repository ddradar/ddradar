import { Container, CosmosClient } from '@azure/cosmos'

/* eslint-disable node/no-process-env */
export const getConnectionString = (readonly?: boolean): string =>
  readonly
    ? process.env.COSMOS_DB_CONN_READONLY || process.env.COSMOS_DB_CONN
    : process.env.COSMOS_DB_CONN
/* eslint-enable node/no-process-env */

let readWriteClient: CosmosClient
let readOnlyClient: CosmosClient

const readOnlyContainers: { [key: string]: Container } = {}
const readWriteContainers: { [key: string]: Container } = {}

export const getContainer = (id: string, readonly?: boolean): Container => {
  if (readonly && !readOnlyClient)
    readOnlyClient = new CosmosClient(getConnectionString(true))
  else if (!readWriteClient)
    readWriteClient = new CosmosClient(getConnectionString())
  const client = readonly ? readOnlyClient : readWriteClient
  const containers = readonly ? readOnlyContainers : readWriteContainers
  if (containers[id] === undefined)
    containers[id] = client.database('DDRadar').container(id)
  return containers[id]
}
