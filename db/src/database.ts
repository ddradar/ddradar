import type {
  ItemDefinition,
  JSONValue,
  Resource,
  SqlParameter,
} from '@azure/cosmos'
import { Container, CosmosClient } from '@azure/cosmos'
import type {
  CourseSchema,
  NotificationSchema,
  ScoreSchema,
  SongSchema,
  UserClearLampSchema,
  UserGrooveRadarSchema,
  UserRankSchema,
  UserSchema,
} from '@ddradar/core'

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
  ? ScoreSchema
  : T extends 'Songs'
    ? SongSchema | CourseSchema
    : T extends 'Users'
      ? UserSchema
      : T extends 'Notification'
        ? NotificationSchema
        : T extends 'UserDetails'
          ? UserGrooveRadarSchema | UserClearLampSchema | UserRankSchema
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

type KeysOfUnion<T> = T extends T ? keyof T : never
type Col<T> = Extract<KeysOfUnion<DbItem<T>>, string>
/** SQL WHERE condition */
export type Condition<T extends ContainerName> =
  | {
      /** WHERE condition */
      condition: `${Exclude<string, '@'>}c.${Col<T>}${Exclude<string, '@'>}`
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
  U extends KeysOfUnion<DbItem<T>>,
>(
  containerName: T,
  columns: readonly U[],
  ...conditions: readonly Condition<T>[]
): Promise<Pick<DbItem<T>, U> | null> {
  // Create SQL statement
  const column = columns.map(s => `c.${s.toString()}`).join(',')
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
  U extends KeysOfUnion<DbItem<T>>,
>(
  containerName: T,
  columns: readonly U[],
  conditions: readonly Condition<T>[],
  orderBy?: Partial<Record<KeysOfUnion<DbItem<T>>, 'ASC' | 'DESC'>>
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
  orderBy?: Partial<Record<KeysOfUnion<DbItem<T>>, 'ASC' | 'DESC'>>
): Promise<DbItem<T>[]>

export async function fetchList<
  T extends ContainerName,
  U extends KeysOfUnion<DbItem<T>>,
>(
  containerName: T,
  columns: readonly U[] | '*',
  conditions: readonly Condition<T>[],
  orderBy: Partial<Record<U, 'ASC' | 'DESC'>> = {}
): Promise<Pick<DbItem<T>, U>[]> {
  // Create SQL statement
  const column =
    columns === '*' ? '*' : columns.map(s => `c.${s.toString()}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const order = Object.entries(orderBy)
    .map(([c, a]) => `c.${c} ${a}`)
    .join(',')
  const query = `SELECT ${column} FROM c WHERE ${condition}${
    order ? ` ORDER BY ${order}` : ''
  }`

  const { resources } = await getContainer(containerName)
    .items.query<Pick<DbItem<T>, U>>({ query, parameters })
    .fetchAll()
  return resources
}

/**
 * Returns joined items that matches conditions from container.
 * @param containerName Container name
 * @param columns Columns
 * @param joinColumn JOIN array
 * @param conditions SQL WHERE conditions
 * @param orderBy Sort order
 */
export async function fetchJoinedList<T extends ContainerName, U>(
  containerName: T,
  columns: readonly (
    | `c.${KeysOfUnion<DbItem<T>>}`
    | `i.${Exclude<KeysOfUnion<U>, symbol | KeysOfUnion<DbItem<T>>>}`
  )[],
  joinColumn: KeysOfUnion<DbItem<T>>,
  conditions: readonly (Condition<T> | SqlCondition)[],
  orderBy: Partial<Record<KeysOfUnion<DbItem<T>>, 'ASC' | 'DESC'>> = {}
): Promise<U[]> {
  // Create SQL statement
  const column = columns.join(',')
  const order = `ORDER BY ${Object.entries(orderBy)
    .map(([c, a]) => `c.${c} ${a}`)
    .join(',')}`
  const { condition, parameters } = createConditions(conditions)
  const query = `SELECT ${column} FROM c JOIN i IN c.${joinColumn} WHERE ${condition} ${order}`

  const { resources } = await getContainer(containerName)
    .items.query<U>({ query, parameters })
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
  groupBy: readonly KeysOfUnion<DbItem<T>>[]
): Promise<U[]> {
  // Create SQL statement
  const column = columns.map(s => (s.includes(' AS ') ? s : `c.${s}`)).join(',')
  const group = groupBy.map(s => `c.${s.toString()}`).join(',')
  const { condition, parameters } = createConditions(conditions)
  const query = `SELECT ${column} FROM c WHERE ${condition} GROUP BY ${group}`

  const { resources } = await getContainer(containerName)
    .items.query<U>({ query, parameters })
    .fetchAll()
  return resources
}

type SqlCondition = { condition: string; value?: JSONValue }
function createConditions(conditions: readonly SqlCondition[]) {
  return {
    condition: conditions
      .map((c, i) => c.condition.replace('@', `@param${i}`))
      .join(' AND '),
    parameters: conditions
      .map((c, i) => ({ name: `@param${i}`, value: c.value }))
      .filter((c): c is SqlParameter => c.value !== undefined),
  }
}
