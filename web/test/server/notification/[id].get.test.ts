// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { notification } from '~/../core/test/data'
import handler from '~/server/api/v1/notification/[id].get'
import { createEvent } from '~/test/test-utils-server'

describe('GET /api/v1/notification/[id]', () => {
  beforeEach(() => {
    vi.mocked($graphql).mockClear()
  })

  test(`/${notification.id} (exist notification) returns NotificationSchema`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ notification_by_pk: notification })
    const event = createEvent({ id: notification.id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toBe(notification)
  })

  test(`/00000000000 (not exist notification) returns 404`, async () => {
    // Arrange
    vi.mocked($graphql).mockResolvedValue({ notification_by_pk: null })
    const event = createEvent({ id: `00000000000` })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
  })
})
