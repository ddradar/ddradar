// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { notifications } from '~/../core/test/data'
import handler from '~/server/api/v1/notification/index.get'
import { createEvent } from '~/test/test-utils-server'

describe('GET /api/v1/notification', () => {
  const result = notifications.map(n => ({
    id: n.id,
    type: n.type,
    icon: n.icon,
    title: n.title,
    body: n.body,
    timeStamp: n.timeStamp,
  }))
  beforeEach(() => {
    vi.mocked($graphqlList).mockClear()
  })

  test.each([
    ['', {}],
    ['foo', {}],
    ['top', { pinned: true }],
    ['TOP', {}],
  ])(
    '?scope=%s calls $graphqlList(event, query, "notifications", %o)',
    async (scope, variables) => {
      // Arrange
      vi.mocked($graphqlList).mockResolvedValue(result)
      const event = createEvent(undefined, { scope })

      // Act
      const notificationList = await handler(event)

      // Assert
      expect(notificationList).toBe(result)
      expect(vi.mocked($graphqlList)).toBeCalledWith(
        event,
        expect.any(String),
        'notifications',
        variables
      )
    }
  )
})
