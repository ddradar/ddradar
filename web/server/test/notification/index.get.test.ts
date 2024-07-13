// @vitest-environment node
import { queryContainer } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { notifications } from '~~/../core/test/data'
import handler from '~~/server/api/v1/notification/index.get'
import { createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

describe('GET /api/v1/notification', () => {
  const resources = notifications.map(n => ({
    id: n.id,
    color: n.color,
    icon: n.icon,
    title: n.title,
    body: n.body,
    timeStamp: n.timeStamp,
  }))
  beforeEach(() => {
    vi.mocked(queryContainer).mockClear()
  })

  test.each([
    ['', [{ condition: 'c.sender = "SYSTEM"' }]],
    ['foo', [{ condition: 'c.sender = "SYSTEM"' }]],
    [
      'top',
      [{ condition: 'c.sender = "SYSTEM"' }, { condition: 'c.pinned = true' }],
    ],
    ['TOP', [{ condition: 'c.sender = "SYSTEM"' }]],
  ])(
    '?scope=%s calls queryContainer(client, "Notification", query, %o)',
    async (scope, conditions) => {
      // Arrange
      vi.mocked(queryContainer).mockReturnValue({
        fetchAll: vi.fn().mockResolvedValue({ resources }),
      } as unknown as ReturnType<typeof queryContainer>)
      const event = createEvent(undefined, { scope })

      // Act
      const notificationList = await handler(event)

      // Assert
      expect(notificationList).toBe(resources)
      expect(vi.mocked(queryContainer)).toBeCalledWith(
        undefined,
        'Notification',
        expect.any(Array),
        conditions
      )
    }
  )
})
