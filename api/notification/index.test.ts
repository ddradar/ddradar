import { notifications } from '@ddradar/core/__tests__/data'

import getNotification from '.'

describe('GET /api/v1/notification', () => {
  const documents = [...notifications]

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
