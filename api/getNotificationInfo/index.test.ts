import type { Context } from '@azure/functions'

import type { NotificationSchema } from '../core/db/notification'
import getNotificationInfo from '.'

describe('GET /api/v1/notification/{id}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const notification: NotificationSchema = {
    id: 'foo',
    sender: 'SYSTEM',
    pinned: false,
    type: 'is-info',
    icon: 'info',
    title: '新曲を追加しました',
    body: '新曲2曲の譜面情報を追加しました。',
    timeStamp: 1597028400,
  }
  beforeEach(() => {
    context.bindingData = {}
  })

  test(`returns "200 OK" with JSON if documents contain 1 notification`, async () => {
    // Arrange
    context.bindingData.id = notification.id

    // Act
    const result = await getNotificationInfo(context, null, [notification])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(notification)
  })

  test(`returns "404 Not Found" if documents is []`, async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getNotificationInfo(context, null, [])

    // Assert
    expect(result.status).toBe(404)
    expect(result.body).toMatch(/"foo"/)
  })
})
