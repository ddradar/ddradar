import type { NotificationSchema } from '../db/notification'
import getNotification from '.'

describe('GET /api/v1/notification', () => {
  const documents: NotificationSchema[] = [
    {
      id: 'foo',
      sender: 'SYSTEM',
      pinned: false,
      type: 'is-info',
      icon: 'info',
      title: '新曲を追加しました',
      body: '新曲2曲の譜面情報を追加しました。',
      timeStamp: 1597028400,
    },
    {
      id: 'bar',
      sender: 'SYSTEM',
      pinned: true,
      type: 'is-warning',
      icon: 'warning',
      title: 'このサイトはベータ版です',
      body: 'このWebサイトはベータ版環境です。',
      timeStamp: 1596250800,
    },
    {
      id: 'baz',
      sender: 'SYSTEM',
      pinned: false,
      type: 'is-info',
      icon: 'info',
      title: 'v0.6.0をリリースしました',
      body: '変更点は以下を参照してください。',
      timeStamp: 1597114800,
    },
  ]

  test('returns "200 OK" with all data', async () => {
    // Arrange
    const req = { query: {} }

    // Act
    const result = await getNotification(null, req, documents)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(3)
  })

  test.each(['full', 'foo'])(
    '/scope=%s returns "200 OK" with all data',
    async scope => {
      // Arrange
      const req = { query: { scope } }

      // Act
      const result = await getNotification(null, req, documents)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(3)
    }
  )

  test('?scope=top returns "200 OK" with pinned data', async () => {
    // Arrange
    const req = { query: { scope: 'top' } }

    // Act
    const result = await getNotification(null, req, documents)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(1)
  })
})
