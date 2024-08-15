// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { notification } from '~~/../core/test/data'
import handler from '~~/server/api/v2/notification/[id].get'
import { createEvent } from '~~/server/test/utils'

describe('GET /api/v2/notification/[id]', () => {
  beforeEach(() => {
    vi.mocked(getNotificationRepository).mockClear()
  })

  test(`/${notification.id} (exist notification) returns NotificationSchema`, async () => {
    // Arrange
    const get = vi.fn().mockResolvedValue(notification)
    vi.mocked(getNotificationRepository).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getNotificationRepository>)
    const event = createEvent({ id: notification.id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toBe(notification)
  })

  test(`/00000000000 (not exist notification) throws 404 error`, async () => {
    // Arrange
    const get = vi.fn().mockResolvedValue(undefined)
    vi.mocked(getNotificationRepository).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getNotificationRepository>)
    const event = createEvent({ id: `00000000000` })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404 })
    )
  })
})
