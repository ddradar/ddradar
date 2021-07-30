/* istanbul ignore file */

import type {
  ItemDefinition,
  JSONValue,
  Resource,
  SqlParameter,
} from '@azure/cosmos'
import { Container, CosmosClient } from '@azure/cosmos'
import type { Database } from '@ddradar/core'

// eslint-disable-next-line node/no-process-env
const connectionString = process.env.COSMOS_DB_CONN

export function canConnectDB(): boolean {
  return !!connectionString
}

//#region DB Container - Schema mapping
type ContainerName =
  | 'Scores'
  | 'Songs'
  | 'Users'
  | 'Notification'
  | 'UserDetails'

type ContainerValue<T> = T extends 'Scores'
  ? Database.ScoreSchema
  : T extends 'Songs'
  ? Database.SongSchema | Database.CourseSchema
  : T extends 'Users'
  ? Database.UserSchema
  : T extends 'Notification'
  ? Database.NotificationSchema
  : T extends 'UserDetails'
  ?
      | Database.ClearStatusSchema
      | Database.GrooveRadarSchema
      | Database.ScoreStatusSchema
  : never

type DbItem<T> = ContainerValue<T> & Resource & Pick<ItemDefinition, 'ttl'>
//#endregion

let client: CosmosClient
const containers: Partial<Record<ContainerName, Container>> = {}

export function getContainer(id: ContainerName): Container {
  if (!client) client = new CosmosClient(connectionString ?? '')
  return (
    containers[id] ??
    (containers[id] = client.database('DDRadar').container(id))
  )
}

export type Condition<T extends ContainerName> = {
  condition: `${string}c.${Extract<keyof DbItem<T>, string>}${string}`
  value?: JSONValue
}

export async function fetchOne<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[],
  ...conditions: readonly Condition<T>[]
): Promise<Pick<DbItem<T>, U> | null> {
  // Create SQL statement
  const column = columns.map(col => `c.${col}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const query = `SELECT TOP 1 ${column} FROM c WHERE ${condition}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<Pick<DbItem<T>, U>>({ query, parameters })
    .fetchAll()
  return resources[0] ?? null
}

export async function fetchList<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[],
  conditions: readonly Condition<T>[],
  orderBy: Partial<Record<keyof DbItem<T>, 'ASC' | 'DESC'>>
): Promise<Pick<DbItem<T>, U>[]>

export async function fetchList<T extends ContainerName>(
  containerName: T,
  columns: '*',
  conditions: readonly Condition<T>[],
  orderBy: Partial<Record<keyof DbItem<T>, 'ASC' | 'DESC'>>
): Promise<DbItem<T>[]>

export async function fetchList<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[] | '*',
  conditions: readonly Condition<T>[],
  orderBy: Partial<Record<U, 'ASC' | 'DESC'>>
): Promise<Pick<DbItem<T>, U>[]> {
  // Create SQL statement
  const column =
    columns === '*' ? columns : columns.map(col => `c.${col}`).join(',')
  const { condition, parameters } = createConditions(conditions)

  const order = Object.entries(orderBy)
    .map(([c, a]) => `c.${c} ${a}`)
    .join(', ')
  const query = `SELECT ${column} FROM c WHERE ${condition} ORDER BY ${order}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<Pick<DbItem<T>, U>>({ query, parameters })
    .fetchAll()
  return resources
}

export async function fetchGroupedList<T extends ContainerName, U>(
  containerName: T,
  columns: readonly (
    | Extract<keyof DbItem<T>, string>
    | `${string} AS ${Extract<keyof U, string>}`
  )[],
  conditions: readonly Condition<T>[],
  groupBy: readonly (keyof DbItem<T>)[]
): Promise<U[]> {
  const column = columns.map(s => (s.includes(' AS ') ? s : `c.${s}`)).join(',')
  const group = groupBy.map(s => `c.${s}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const query = `SELECT ${column} FROM c WHERE ${condition} GROUP BY ${group}`

  const container = getContainer(containerName)
  const { resources } = await container.items
    .query<U>({ query, parameters })
    .fetchAll()
  return resources
}

function createConditions<T extends ContainerName>(
  conditions: readonly Condition<T>[]
) {
  return {
    condition: conditions
      .map((c, i) => c.condition.replace('@', `@param${i}`))
      .join(' AND '),
    parameters: conditions
      .map((c, i) => ({ name: `@param${i}`, value: c.value }))
      .filter((c): c is SqlParameter => c.value !== undefined),
  }
}
