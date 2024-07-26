import type { CosmosClient } from '@azure/cosmos'
import { type User, userSchema } from '@ddradar/core'

import { databaseName, userDataContainer } from '../constants'
import { type DBUserSchema, dbUserSchema } from '../schemas/userData'
import { generateQueryConditions, type QueryFilter } from '../utils'

/** Repository for User data. */
export class UserRepository {
  /**
   * Create a new repository instance.
   * @param client Cosmos DB client
   */
  constructor(private readonly client: CosmosClient) {}

  /**
   * Get user data by ID.
   * @param id User ID
   * @param loginId User login id (Auto generated by Azure Authentication)
   * @returns User data
   */
  async get(id: string, loginId: string = ''): Promise<User | undefined> {
    const { queryConditions, parameters } = generateQueryConditions([
      { condition: 'c.type = "user"' },
      { condition: 'c.id = @', value: id },
      { condition: 'c.uid = @', value: id },
      { condition: '(c.isPublic OR c.loginId = @)', value: loginId },
    ])
    const { resources } = await this.client
      .database(databaseName)
      .container(userDataContainer)
      .items.query<User>(
        {
          query: `SELECT TOP 1 c.id, c.name, c.area, c.code, c.isPublic FROM c WHERE ${queryConditions}`,
          parameters,
        },
        { maxItemCount: 1 }
      )
      .fetchNext()
    return resources[0]
  }

  /**
   * Get user list that matches the conditions.
   * @param conditions Filtering conditions.
   * @param loginId User login id (Auto generated by Azure Authentication)
   * @returns User list that matches the conditions.
   */
  async list(
    conditions: QueryFilter<DBUserSchema>[],
    loginId: string = ''
  ): Promise<Omit<User, 'isPublic'>[]> {
    const { queryConditions, parameters } = generateQueryConditions([
      { condition: 'c.type = "user"' },
      { condition: '(c.isPublic OR c.loginId = @)', value: loginId },
      ...conditions,
    ])
    const { resources } = await this.client
      .database(databaseName)
      .container(userDataContainer)
      .items.query<User>({
        query: `SELECT c.id, c.name, c.area, c.code FROM c WHERE ${queryConditions} ORDER BY c.name ASC`,
        parameters,
      })
      .fetchAll()
    return resources
  }

  /**
   * Check if the user data exists.
   * @param id User ID
   * @returns `true` if the user data exists.
   */
  async exists(id: string): Promise<boolean> {
    const { resources } = await this.client
      .database(databaseName)
      .container(userDataContainer)
      .items.query<Pick<User, 'id'>>(
        {
          query: `SELECT TOP 1 c.id FROM c WHERE c.id = @id`,
          parameters: [{ name: '@id', value: id }],
        },
        { maxItemCount: 1 }
      )
      .fetchNext()
    return resources.length > 0
  }

  /**
   * Check if the user is an administrator.
   * @param loginId User login id (Auto generated by Azure Authentication)
   * @returns `true` if the user is an administrator.
   */
  async isAdministrator(loginId: string): Promise<boolean> {
    const { resources } = await this.client
      .database(databaseName)
      .container(userDataContainer)
      .items.query<Pick<User, 'id'>>(
        {
          query: `SELECT TOP 1 c.id FROM c WHERE c.type = "user" AND c.loginId = @id AND c.isAdmin = true`,
          parameters: [{ name: '@id', value: loginId }],
        },
        { maxItemCount: 1 }
      )
      .fetchNext()
    return resources.length > 0
  }

  /**
   * Create new user data.
   * @param user User data to create.
   * @param loginId User login id (Auto generated by Azure Authentication)
   */
  async create(user: User, loginId: string): Promise<void> {
    const validatedUser = dbUserSchema.parse({
      ...user,
      type: 'user',
      uid: user.id,
      loginId,
    })
    await this.client
      .database(databaseName)
      .container(userDataContainer)
      .items.create<DBUserSchema>(validatedUser)
  }

  /**
   * Update user data.
   * @param user User data to update.
   */
  async update(user: User): Promise<void> {
    const { id, name, area, code, isPublic } = userSchema.parse(user)
    await this.client
      .database(databaseName)
      .container(userDataContainer)
      .item(id, id)
      .patch<DBUserSchema>([
        { op: 'replace', path: '/name', value: name },
        { op: 'replace', path: '/area', value: area },
        code
          ? { op: 'replace', path: '/code', value: code }
          : { op: 'remove', path: '/code' },
        { op: 'replace', path: '/isPublic', value: isPublic },
      ])
  }
}