// @vitest-environment node
import { queryContainer } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { notification } from '~~/../core/test/data'
import handler from '~~/server/api/v1/notification/[id].get'
import { createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

describe('GET /api/v1/notification/[id]', () => {
  beforeEach(() => {
    vi.mocked(queryContainer).mockClear()
  })

  test(`/${notification.id} (exist notification) returns NotificationSchema`, async () => {
    // Arrange
    vi.mocked(queryContainer).mockReturnValue({
      fetchNext: vi.fn().mockResolvedValue({ resources: [notification] }),
    } as unknown as ReturnType<typeof queryContainer>)
    const event = createEvent({ id: notification.id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toBe(notification)
  })

  test(`/00000000000 (not exist notification) returns 404`, async () => {
    // Arrange
    vi.mocked(queryContainer).mockReturnValue({
      fetchNext: vi.fn().mockResolvedValue({ resources: [] }),
    } as unknown as ReturnType<typeof queryContainer>)
    const event = createEvent({ id: `00000000000` })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
  })
})
