import { CosmosClient } from '@azure/cosmos'
import { SongRepository } from '@ddradar/db'
import type { H3Event } from 'h3'

let _client: CosmosClient | undefined

export function getCosmosClient(event: H3Event): CosmosClient {
  return (_client ??= new CosmosClient(useRuntimeConfig(event).cosmosDBConn))
}

export function getSongRepository(event: H3Event) {
  return new SongRepository(getCosmosClient(event))
}