import { CosmosClient } from '@azure/cosmos'

import { connection } from './constants.js'

let client: CosmosClient

export function getClient(): CosmosClient {
  return (client ??= new CosmosClient(process.env[connection]!))
}
