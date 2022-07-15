import { notification } from '@ddradar/core/__tests__/data'
import { fetchOne } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import getNotificationInfo from '~/server/api/v1/notification/[id].get'
import { sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('~/server/utils')

describe('GET /api/v1/notification', () => {
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
  })

  test(`/${notification.id} (exist notification) returns NotificationSchema`, async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(notification as any)
    const event = createEvent({ id: notification.id })

    // Act
    const result = await getNotificationInfo(event)

    // Assert
    expect(result).toBe(notification)
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })

  test(`/00000000000 (not exist notification) returns 404`, async () => {
    // Arrange
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id: `00000000000` })

    // Act
    const result = await getNotificationInfo(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })
})
