import { Container, CosmosClient } from '@azure/cosmos'

export const getContainer = (id: string, readonly?: boolean): Container => {
  const connectionString = getConnectionString(readonly)
  if (!connectionString)
    throw new Error(
      'Connection string is not set in COSMOS_DB_CONN or COSMOS_DB_CONN_READONLY'
    )
  const client = new CosmosClient(connectionString)
  return client.database('DDRadar').container(id)
}

/* eslint-disable node/no-process-env */
export const getConnectionString = (readonly?: boolean): string =>
  readonly
    ? process.env.COSMOS_DB_CONN_READONLY || process.env.COSMOS_DB_CONN
    : process.env.COSMOS_DB_CONN
/* eslint-enable node/no-process-env */
