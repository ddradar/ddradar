import type { Notification } from '@ddradar/core'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { databaseName, notificationContainer } from '../../src/constants'
import { NotificationRepository } from '../../src/repositories/NotificationRepository'
import type { DBNotificationSchema } from '../../src/schemas/notification'
import { notifications } from '../data'
import { canConnectDB, getClient } from '../utils'

describe.runIf(canConnectDB())(
  '/repositories/NotificationRepository (End-to-End)',
  () => {
    // Prepare temporary item
    const notExistsId = 'notExists'
    let store: DBNotificationSchema | undefined = undefined

    beforeAll(async () => {
      const temporaryItem = getClient()
        .database(databaseName)
        .container(notificationContainer)
        .item(notExistsId, 'SYSTEM')
      const res = await temporaryItem.read<DBNotificationSchema>()
      store = res.resource
      if (store) await temporaryItem.delete()
    })
    afterAll(async () => {
      if (store)
        await getClient()
          .database(databaseName)
          .container(notificationContainer)
          .items.create(store)
    })

    describe('get', () => {
      test(`("${notifications[0].id}") returns Notification`, async () => {
        // Arrange - Act
        const repo = new NotificationRepository(getClient())
        const result = await repo.get(notifications[0].id!)

        // Assert
        expect(result).toStrictEqual({
          id: notifications[0].id,
          color: notifications[0].color,
          icon: notifications[0].icon,
          title: notifications[0].title,
          body: notifications[0].body,
          timeStamp: notifications[0].timeStamp,
        })
      })
      test(`("${notExistsId}") returns undefined`, async () => {
        // Arrange - Act
        const repo = new NotificationRepository(getClient())
        const result = await repo.get(notExistsId)

        // Assert
        expect(result).toBeUndefined()
      })
    })

    describe('list', () => {
      test('({ condition: "c.pinned = @", value: true }) returns 1 rows', async () => {
        // Arrange - Act
        const repo = new NotificationRepository(getClient())
        const result = await repo.list([
          { condition: 'c.pinned = @', value: true },
        ])

        // Assert
        expect(result).toStrictEqual([
          {
            id: notifications[0].id,
            color: notifications[0].color,
            icon: notifications[0].icon,
            title: notifications[0].title,
            body: notifications[0].body,
            timeStamp: notifications[0].timeStamp,
          },
        ])
      })
      test('({ condition: "c.sender != @", value: "SYSTEM" }) returns 0 rows', async () => {
        // Arrange - Act
        const repo = new NotificationRepository(getClient())
        const result = await repo.list([
          { condition: 'c.sender != @', value: 'SYSTEM' },
        ])

        // Assert
        expect(result).toStrictEqual([])
      })
    })

    describe('upsert', () => {
      let id: string
      afterAll(async () => {
        await getClient()
          .database(databaseName)
          .container(notificationContainer)
          .item(id, 'SYSTEM')
          .delete()
      })

      test('returns Notification', async () => {
        // Arrange (Insert)
        const body: Omit<Notification, 'id'> = {
          color: 'yellow',
          icon: 'i-heroicons-exclamation-triangle',
          title: 'テストデータ',
          body: 'このデータはテスト用です',
          timeStamp: 1597028400,
        }
        const repo = new NotificationRepository(getClient())
        // Act (Insert)
        const insertResult = await repo.upsert(body, false)
        // Assert (Insert)
        expect(insertResult).toStrictEqual(
          expect.objectContaining({ ...body, pinned: false })
        )
        id = insertResult.id!

        // Arrange (Update)
        const updated: Notification = {
          id: insertResult.id!,
          color: 'blue',
          icon: 'i-heroicons-information-circle',
          title: 'テストデータ',
          body: 'このデータはテスト用です 更新',
          timeStamp: 1597028400,
        }
        // Act (Update)
        const updateResult = await repo.upsert(updated, true)
        // Assert (Update)
        expect(updateResult).toStrictEqual(
          expect.objectContaining({ ...updated, pinned: true })
        )
      })
    })
  }
)
