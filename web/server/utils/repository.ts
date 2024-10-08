import { CosmosClient } from '@azure/cosmos'
import {
  NotificationRepository,
  ScoreRepository,
  SongRepository,
  UserRepository,
} from '@ddradar/db'
import type { H3Event } from 'h3'

let _client: CosmosClient | undefined

export function getCosmosClient(event: H3Event): CosmosClient {
  return (_client ??= new CosmosClient(useRuntimeConfig(event).cosmosDBConn))
}

export function getNotificationRepository(event: H3Event) {
  return new NotificationRepository(getCosmosClient(event))
}

export function getScoreRepository(event: H3Event) {
  return new ScoreRepository(getCosmosClient(event))
}

export function getSongRepository(event: H3Event) {
  return new SongRepository(getCosmosClient(event))
}

export function getUserRepository(event: H3Event) {
  return new UserRepository(getCosmosClient(event))
}
