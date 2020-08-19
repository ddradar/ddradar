import { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { NotificationSchema } from '../db'
import getNotificationInfo from '.'

describe('GET /api/v1/notification/', () => {
  let context: Pick<Context, 'bindingData'>
  beforeEach(() => {
    context = { bindingData: {} }
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getNotificationInfo(context)

    // Assert
    expect(result.status).toBe(404)
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const notification: NotificationSchema[] = [
        {
          id: 'foo',
          sender: 'SYSTEM',
          pinned: false,
          type: 'is-info',
          icon: 'info',
          title: '新曲を追加しました',
          body: '新曲2曲の譜面情報を追加しました。',
          _ts: 1597028400,
        },
        {
          id: 'bar',
          sender: 'SYSTEM',
          pinned: true,
          type: 'is-warning',
          icon: 'warning',
          title: 'このサイトはベータ版です',
          body: 'このWebサイトはベータ版環境です。',
          _ts: 1596250800,
        },
        {
          id: 'baz',
          sender: 'SYSTEM',
          pinned: false,
          type: 'is-info',
          icon: 'info',
          title: 'v0.6.0をリリースしました',
          body: '変更点は以下を参照してください。',
          _ts: 1597114800,
        },
      ]
      beforeAll(async () => {
        await Promise.all(
          notification.map(d => getContainer('Notification').items.create(d))
        )
      })

      test('/aaa returns "404 Not Found"', async () => {
        // Arrange
        context.bindingData.id = 'aaa'

        // Act
        const result = await getNotificationInfo(context)

        // Assert
        expect(result.status).toBe(404)
      })
      test('/foo returns "404 Not Found"', async () => {
        // Arrange
        context.bindingData.id = 'foo'
        const expected: Omit<NotificationSchema, '_ts'> = {
          id: notification[0].id,
          sender: notification[0].sender,
          pinned: notification[0].pinned,
          type: notification[0].type,
          icon: notification[0].icon,
          title: notification[0].title,
          body: notification[0].body,
        }

        // Act
        const result = await getNotificationInfo(context)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(expected)
      })

      afterAll(async () => {
        await Promise.all(
          notification.map(d =>
            getContainer('Notification').item(d.id, d.sender).delete()
          )
        )
      })
    }
  )
})
