// @vitest-environment node
import { notifications } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/notification/index.get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/notification', () => {
  beforeEach(() => {
    vi.mocked(getNotificationRepository).mockClear()
  })

  test.each([
    ['', []],
    ['foo', []],
    ['top', [{ condition: 'c.pinned = true' }]],
    ['TOP', []],
  ])(
    '?scope=%s calls queryContainer(client, "Notification", query, %o)',
    async (scope, conditions) => {
      // Arrange
      const list = vi.fn().mockResolvedValue([...notifications])
      vi.mocked(getNotificationRepository).mockReturnValue({
        list,
      } as unknown as ReturnType<typeof getNotificationRepository>)
      const event = createEvent(undefined, { scope })

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual(notifications)
      expect(list).toHaveBeenCalledWith(conditions)
    }
  )
})
