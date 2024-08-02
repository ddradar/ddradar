import type { CosmosClient } from '@azure/cosmos'
import type { Notification } from '@ddradar/core'

import { databaseName, notificationContainer } from '../constants'
import type { DBNotificationSchema } from '../schemas/notification'
import type { Column, QueryFilter } from '../utils'
import { generateQueryConditions } from '../utils'

const columns: Column<DBNotificationSchema, Notification>[] = [
  'c.id',
  'c.color',
  'c.icon',
  'c.title',
  'c.body',
  'c.timeStamp',
]

export class NotificationRepository {
  /**
   * Create a new repository instance.
   * @param client Cosmos DB client
   */
  constructor(private readonly client: CosmosClient) {}

  async get(id: string): Promise<Notification | undefined> {
    const { resources } = await this.client
      .database(databaseName)
      .container(notificationContainer)
      .items.query<Notification>({
        query: `SELECT TOP 1 ${columns.join(', ')} FROM c WHERE c.id = @id AND c.sender = "SYSTEM" AND c.type = "notification"`,
        parameters: [{ name: '@id', value: id }],
      })
      .fetchNext()
    return resources[0]
  }

  async list(
    conditions: QueryFilter<DBNotificationSchema>[]
  ): Promise<Notification[]> {
    const { queryConditions, parameters } = generateQueryConditions([
      { condition: 'c.sender = "SYSTEM"' },
      { condition: 'c.type = "notification"' },
      ...conditions,
    ])
    const { resources } = await this.client
      .database(databaseName)
      .container(notificationContainer)
      .items.query<Notification>({
        query: `SELECT ${columns.join(', ')} FROM c WHERE ${queryConditions} ORDER BY c.pinned DESC, c.timeStamp DESC`,
        parameters,
      })
      .fetchAll()
    return resources
  }

  async upsert(
    data: Omit<Notification, 'id'> & Partial<Pick<Notification, 'id'>>,
    pinned: boolean
  ): Promise<DBNotificationSchema> {
    const { resource } = await this.client
      .database(databaseName)
      .container(notificationContainer)
      .items.upsert<DBNotificationSchema>({
        ...data,
        pinned,
      } as DBNotificationSchema)
    return resource!
  }
}
