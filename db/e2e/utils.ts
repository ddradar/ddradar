import 'dotenv/config'

import { CosmosClient } from '@azure/cosmos'

export const hasConnectionStrings = !!process.env.COSMOS_DB_CONN

let _client: CosmosClient | undefined
export function getClient(): CosmosClient {
  return (_client ??= new CosmosClient(process.env.COSMOS_DB_CONN!))
}
