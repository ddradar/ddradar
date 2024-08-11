import type { CosmosClient } from '@azure/cosmos'
import { notification, notifications } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { NotificationRepository } from '../../src/repositories/NotificationRepository'

describe('/repositories/NotificationRepository', () => {
  const client = {
    database: vi.fn().mockReturnThis(),
    container: vi.fn().mockReturnThis(),
    items: {
      query: vi.fn().mockReturnThis(),
      fetchNext: vi.fn(),
      fetchAll: vi.fn(),
      upsert: vi.fn(),
    },
  }
  beforeEach(() => {
    client.items.query.mockClear()
    client.items.fetchNext.mockClear()
    client.items.fetchAll.mockClear()
    client.items.upsert.mockClear()
  })

  describe('get', () => {
    test('calls query().fetchNext()', async () => {
      // Arrange
      client.items.fetchNext.mockResolvedValueOnce({
        resources: [notification],
      })

      // Act
      const repo = new NotificationRepository(client as unknown as CosmosClient)
      const result = await repo.get('test')

      // Assert
      expect(result).toStrictEqual(notification)
      expect(client.items.query).toBeCalledWith({
        query:
          'SELECT TOP 1 c.id, c.color, c.icon, c.title, c.body, c.timeStamp ' +
          'FROM c WHERE c.id = @id AND c.sender = "SYSTEM" AND c.type = "notification"',
        parameters: [{ name: '@id', value: 'test' }],
      })
      expect(client.items.fetchNext).toBeCalled()
    })
  })

  describe('list', () => {
    test('calls query().fetchAll()', async () => {
      // Arrange
      client.items.fetchAll.mockResolvedValueOnce({ resources: notifications })

      // Act
      const repo = new NotificationRepository(client as unknown as CosmosClient)
      const result = await repo.list([
        { condition: 'c.pinned = @', value: true },
      ])

      // Assert
      expect(result).toStrictEqual(notifications)
      expect(client.items.query).toBeCalledWith({
        query:
          'SELECT c.id, c.color, c.icon, c.title, c.body, c.timeStamp ' +
          'FROM c WHERE (c.sender = "SYSTEM") AND (c.type = "notification") AND (c.pinned = @param2) ' +
          'ORDER BY c.pinned DESC, c.timeStamp DESC',
        parameters: [{ name: '@param2', value: true }],
      })
      expect(client.items.fetchAll).toBeCalled()
    })
  })

  describe('upsert', () => {
    test('calls upsert()', async () => {
      // Arrange
      client.items.upsert.mockResolvedValueOnce({ resource: notification })

      // Act
      const repo = new NotificationRepository(client as unknown as CosmosClient)
      const result = await repo.upsert(notification, true)

      // Assert
      expect(result).toStrictEqual(notification)
      expect(client.items.upsert).toBeCalledWith({
        ...notification,
        pinned: true,
      })
    })
  })
})
