import 'dotenv/config'

import { CosmosClient } from '@azure/cosmos'

export function canConnectDB(): boolean {
  return !!process.env.COSMOS_DB_CONN
}

let _client: CosmosClient | undefined
export function getClient(): CosmosClient {
  return (_client ??= new CosmosClient(process.env.COSMOS_DB_CONN ?? ''))
}
