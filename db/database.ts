/* c8 ignore start */
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

/** Returns Cosmos DB connection string is defined or not. */
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

/** Singleton instance to connect to Cosmos DB */
let client: CosmosClient
/** Singleton instances to access DB container */
const containers: Partial<Record<ContainerName, Container>> = {}

/**
 * Get or create DB container.
 * @description If you calls simple SELECT SQL, use `fetchXXX` instead.
 */
export function getContainer(id: ContainerName): Container {
  if (!client) client = new CosmosClient(connectionString ?? '')
  return (
    containers[id] ??
    (containers[id] = client.database('DDRadar').container(id))
  )
}

type Col<T> = Extract<keyof DbItem<T>, string>
/** SQL WHERE condition */
export type Condition<T extends ContainerName> =
  | {
      /** WHERE condition */
      condition: `${string}c.${Col<T>}${string}`
      value?: never
    }
  | {
      /**
       * WHERE condition.
       * `"@"` replaces to `"@paramXX"`.
       */
      condition:
        | `${string}c.${Col<T>}${string}@${string}`
        | `${string}@${string}c.${Col<T>}${string}`
      /** Parameter value */ value: JSONValue
    }

/**
 * Returns TOP 1 object that matches conditions from container.
 * @param containerName Container name
 * @param columns Columns
 * @param conditions SQL WHERE conditions
 */
export async function fetchOne<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[],
  ...conditions: readonly Condition<T>[]
): Promise<Pick<DbItem<T>, U> | null> {
  // Create SQL statement
  const column = columns.map(s => `c.${s}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const query = `SELECT TOP 1 ${column} FROM c WHERE ${condition}`

  const { resources } = await getContainer(containerName)
    .items.query<Pick<DbItem<T>, U>>({ query, parameters })
    .fetchAll()
  return resources[0] ?? null
}

/**
 * Returns items that matches conditions from container.
 * @param containerName Container name
 * @param columns Columns (`'*'` means all columns)
 * @param conditions SQL WHERE conditions
 * @param orderBy Sort order
 */
export async function fetchList<
  T extends ContainerName,
  U extends keyof DbItem<T>
>(
  containerName: T,
  columns: readonly U[],
  conditions: readonly Condition<T>[],
  orderBy: Partial<Record<keyof DbItem<T>, 'ASC' | 'DESC'>>
): Promise<Pick<DbItem<T>, U>[]>

/**
 * Returns items that matches conditions from container.
 * @param containerName Container name
 * @param columns Columns (`'*'` means all columns)
 * @param conditions SQL WHERE conditions
 * @param orderBy Sort order
 */
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
  const column = columns === '*' ? '*' : columns.map(s => `c.${s}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const order = Object.entries(orderBy)
    .map(([c, a]) => `c.${c} ${a}`)
    .join(',')
  const query = `SELECT ${column} FROM c WHERE ${condition} ORDER BY ${order}`

  const { resources } = await getContainer(containerName)
    .items.query<Pick<DbItem<T>, U>>({ query, parameters })
    .fetchAll()
  return resources
}

/**
 * Returns grouped items that matches conditions from container.
 * @param containerName Container name
 * @param columns Columns
 * @param conditions SQL WHERE conditions
 * @param groupBy GROUP BY
 */
export async function fetchGroupedList<T extends ContainerName, U>(
  containerName: T,
  columns: readonly (Col<T> | `${string} AS ${Extract<keyof U, string>}`)[],
  conditions: readonly Condition<T>[],
  groupBy: readonly (keyof DbItem<T>)[]
): Promise<U[]> {
  // Create SQL statement
  const column = columns.map(s => (s.includes(' AS ') ? s : `c.${s}`)).join(',')
  const group = groupBy.map(s => `c.${s}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const query = `SELECT ${column} FROM c WHERE ${condition} GROUP BY ${group}`

  const { resources } = await getContainer(containerName)
    .items.query<U>({ query, parameters })
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
/* c8 ignore stop */
