import { Container, CosmosClient, JSONValue, SqlParameter } from '@azure/cosmos'

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

export type ItemDefinition = {
  /** The id of the item. User settable property. Uniquely identifies the item along with the partition key */
  id?: string
  /** Time to live in seconds for collections with TTL enabled */
  ttl?: number
  /** System generated property. Specifies the last updated timestamp of the resource. The value is a timestamp. */
  _ts?: number
}

export type Condition = {
  condition: string
  value?: JSONValue
}

export async function fetchOne<T>(
  containerName: ContainerName,
  columns: (keyof T | 'id' | 'ttl')[],
  conditions: Condition[]
): Promise<(T & ItemDefinition) | null> {
  // Create SQL statement
  const column = columns.map(col => `c.${col}`).join(', ')
  const condition = conditions
    .map((c, i) => c.condition.replace('@', `@param${i}`))
    .join(' AND ')
  const parameters = conditions
    .filter(c => c.value !== undefined)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map<SqlParameter>((c, i) => ({ name: `@param${i}`, value: c.value! }))
  const query = `SELECT ${column} FROM c WHERE ${condition}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<T & ItemDefinition>({ query, parameters })
    .fetchNext()
  return resources[0] ?? null
}

export async function fetchList<T>(
  containerName: ContainerName,
  columns: (keyof T | ItemDefinition)[],
  conditions: Condition[],
  orderBy: Record<keyof (T | ItemDefinition), 'ASC' | 'DESC'>
): Promise<(T & ItemDefinition)[]> {
  // Create SQL statement
  const column = columns.map(col => `c.${col}`).join(', ')
  const condition = conditions
    .map((c, i) => c.condition.replace('@', `@param${i}`))
    .join(' AND ')
  const parameters = conditions
    .filter(c => c.value !== undefined)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map<SqlParameter>((c, i) => ({ name: `@param${i}`, value: c.value! }))
  const order = Object.entries(orderBy)
    .map(([c, a]) => `c.${c} ${a}`)
    .join(', ')
  const query = `SELECT ${column} FROM c WHERE ${condition} ORDER BY ${order}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<T & ItemDefinition>({ query, parameters })
    .fetchAll()
  return resources
}
