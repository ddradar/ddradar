import { Container, CosmosClient, SqlParameter } from '@azure/cosmos'

import type { NotificationSchema } from './notification'
import type { ScoreSchema } from './scores'
import type { CourseSchema, SongSchema } from './songs'
import type { UserSchema } from './users'

export type {
  CourseSchema,
  NotificationSchema,
  ScoreSchema,
  SongSchema,
  UserSchema,
}

type ContainerName = 'Scores' | 'Songs' | 'Users' | 'Notification'

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

export async function fetchOne<T>(
  containerName: ContainerName,
  columns: Readonly<(keyof T)[]>,
  conditions: Readonly<string[]>,
  parameters: SqlParameter[]
): Promise<T | null> {
  const container = getContainer(containerName, true)
  const { resources } = await container.items
    .query<T>({
      query:
        `SELECT ${columns.map(col => `c.${col}`).join(', ')} ` +
        'FROM c ' +
        `WHERE ${conditions.join(' AND ')}`,
      parameters,
    })
    .fetchAll()
  return resources.length === 0 ? null : resources[0]
}

export async function fetchList<T>(
  containerName: ContainerName,
  columns: Readonly<(keyof T)[]>,
  conditions?: Readonly<string[]>,
  parameters?: SqlParameter[],
  orders?: Readonly<{ [key in keyof T]?: 'ASC' | 'DESC' }>
): Promise<T[]> {
  const container = getContainer(containerName, true)
  const condition = conditions ? ` WHERE ${conditions.join(' AND ')}` : ''
  const orderBy = orders
    ? ` ORDER BY ${Object.entries(orders)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}`
    : ''
  const { resources } = await container.items
    .query<T>({
      query:
        `SELECT ${columns.map(col => `c.${col}`).join(', ')} ` +
        'FROM c' +
        condition +
        orderBy,
      parameters,
    })
    .fetchAll()
  return resources
}
