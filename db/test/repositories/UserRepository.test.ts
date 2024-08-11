import type { CosmosClient } from '@azure/cosmos'
import { publicUser } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { UserRepository } from '../../src/repositories/UserRepository'

describe('UserRepository', () => {
  const client = {
    database: vi.fn().mockReturnThis(),
    container: vi.fn().mockReturnThis(),
    item: vi.fn().mockReturnThis(),
    items: {
      query: vi.fn().mockReturnThis(),
      fetchNext: vi.fn(),
      fetchAll: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    patch: vi.fn(),
  }
  beforeEach(() => {
    client.item.mockClear()
    client.patch.mockClear()
    client.items.query.mockClear()
    client.items.fetchNext.mockClear()
    client.items.fetchAll.mockClear()
    client.items.create.mockClear()
    client.items.upsert.mockClear()
  })

  describe('get', () => {
    test.each([
      [undefined, undefined],
      ['', ''],
    ])('(%o, %o) throws Error', async () => {
      // Arrange
      const repository = new UserRepository(client as unknown as CosmosClient)

      // Act & Assert
      await expect(() => repository.get()).rejects.toThrowError(
        'id or loginId is required.'
      )
      expect(client.items.query).not.toBeCalled()
    })
    test.each([
      [
        publicUser.id,
        '',
        '(c.id = @param1) AND (c.uid = @param2) AND (c.isPublic OR c.loginId = @param3)',
        [
          { name: '@param1', value: publicUser.id },
          { name: '@param2', value: publicUser.id },
          { name: '@param3', value: '' },
        ],
      ],
      [
        publicUser.id,
        'loginId',
        '(c.id = @param1) AND (c.uid = @param2) AND (c.isPublic OR c.loginId = @param3)',
        [
          { name: '@param1', value: publicUser.id },
          { name: '@param2', value: publicUser.id },
          { name: '@param3', value: 'loginId' },
        ],
      ],
      [
        undefined,
        'loginId',
        '(c.isPublic OR c.loginId = @param1)',
        [{ name: '@param1', value: 'loginId' }],
      ],
    ])(
      '(%o, %o) calls items.query({ query: "%s", parameters: %o })',
      async (id, loginId, condition, parameters) => {
        // Arrange
        client.items.fetchNext.mockResolvedValue({ resources: [publicUser] })

        // Act
        const repository = new UserRepository(client as unknown as CosmosClient)
        const result = await repository.get(id, loginId)

        // Assert
        expect(result).toEqual(publicUser)
        expect(client.items.query).toBeCalledWith(
          {
            query: `SELECT TOP 1 c.id, c.name, c.area, c.code, c.isPublic FROM c WHERE (c.type = "user") AND ${condition}`,
            parameters,
          },
          { maxItemCount: 1 }
        )
      }
    )
  })
  describe('list', () => {
    test('calls items.query()', async () => {
      // Arrange
      client.items.fetchAll.mockResolvedValue({ resources: [publicUser] })

      // Act
      const repository = new UserRepository(client as unknown as CosmosClient)
      const result = await repository.list(
        [{ condition: 'c.area = @', value: 13 }],
        'loginId'
      )

      // Assert
      expect(result).toEqual([publicUser])
      expect(client.items.query).toBeCalledWith({
        query:
          'SELECT c.id, c.name, c.area, c.code FROM c WHERE (c.type = "user") AND (c.isPublic OR c.loginId = @param1) AND (c.area = @param2) ORDER BY c.name ASC',
        parameters: [
          { name: '@param1', value: 'loginId' },
          { name: '@param2', value: 13 },
        ],
      })
    })
  })
  describe('exists', () => {
    test.each([
      [true, [publicUser]],
      [false, []],
    ])(
      'returns %o when items.query() returns %o',
      async (expected, resources) => {
        // Arrange
        client.items.fetchNext.mockResolvedValue({ resources })

        // Act
        const repository = new UserRepository(client as unknown as CosmosClient)
        const result = await repository.exists(publicUser.id)

        // Assert
        expect(result).toBe(expected)
        expect(client.items.query).toBeCalledWith(
          {
            query:
              'SELECT TOP 1 c.id, c.name, c.area, c.code, c.isPublic FROM c WHERE (c.type = "user") AND (c.id = @param1)',
            parameters: [{ name: '@param1', value: publicUser.id }],
          },
          { maxItemCount: 1 }
        )
      }
    )
  })
  describe('isAdministrator', () => {
    test.each([
      [true, [publicUser]],
      [false, []],
    ])(
      'returns %o when items.query() returns %o',
      async (expected, resources) => {
        // Arrange
        client.items.fetchNext.mockResolvedValue({ resources })

        // Act
        const repository = new UserRepository(client as unknown as CosmosClient)
        const result = await repository.isAdministrator('loginId')

        // Assert
        expect(result).toBe(expected)
        expect(client.items.query).toBeCalledWith(
          {
            query:
              'SELECT TOP 1 c.id, c.name, c.area, c.code, c.isPublic FROM c WHERE (c.type = "user") AND (c.loginId = @param1) AND (c.isAdmin = true)',
            parameters: [{ name: '@param1', value: 'loginId' }],
          },
          { maxItemCount: 1 }
        )
      }
    )
  })
  describe('create', () => {
    test('calls items.create()', async () => {
      // Arrange
      const repository = new UserRepository(client as unknown as CosmosClient)

      // Act
      await repository.create(publicUser, 'loginId')

      // Assert
      expect(client.items.create).toBeCalledWith({
        ...publicUser,
        type: 'user',
        uid: publicUser.id,
        loginId: 'loginId',
      })
    })
  })
  describe('update', () => {
    test.each([
      [
        publicUser,
        [
          { op: 'replace', path: '/name', value: publicUser.name },
          { op: 'replace', path: '/area', value: publicUser.area },
          { op: 'replace', path: '/code', value: publicUser.code },
          { op: 'replace', path: '/isPublic', value: publicUser.isPublic },
        ],
      ],
      [
        { ...publicUser, code: undefined },
        [
          { op: 'replace', path: '/name', value: publicUser.name },
          { op: 'replace', path: '/area', value: publicUser.area },
          { op: 'remove', path: '/code' },
          { op: 'replace', path: '/isPublic', value: publicUser.isPublic },
        ],
      ],
    ])('(%o) calls item.patch(%o)', async (user, patchRequest) => {
      // Arrange
      const repository = new UserRepository(client as unknown as CosmosClient)

      // Act
      await repository.update(user)

      // Assert
      expect(client.item).toBeCalledWith(user.id, user.id)
      expect(client.patch).toBeCalledWith(patchRequest)
    })
  })
})
