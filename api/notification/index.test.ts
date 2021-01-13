import { notifications } from '../core/__tests__/data'
import getNotification from '.'

describe('GET /api/v1/notification', () => {
  const documents = notifications.map(d => ({
    id: d.id,
    type: d.type,
    icon: d.icon,
    title: d.title,
    body: d.body,
    timeStamp: d.timeStamp,
  }))

  test('returns "200 OK" with JSON body', async () => {
    // Arrange
    const req = { query: {} }

    // Act
    const result = await getNotification(null, req, documents)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(documents)
  })
})
