// @vitest-environment node
import { notification } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import postNotification from '~~/server/api/v2/notification/index.post'
import { createEvent } from '~~/server/test/utils'

const timeStamp = 1597114800
Date.now = vi.fn(() => timeStamp * 1000)

describe('POST /api/v2/notification', () => {
  const validBody = {
    color: notification.color,
    icon: notification.icon,
    title: notification.title,
    body: notification.body,
  }
  beforeEach(() => {
    vi.mocked(getNotificationRepository).mockClear()
  })

  test('throws 401 error when user does not have "administrator" role', async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(false)
    const event = createEvent(undefined, undefined, validBody)

    // Act - Assert
    await expect(postNotification(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 401 })
    )
    expect(vi.mocked(getNotificationRepository)).not.toHaveBeenCalled()
  })

  test.each([
    undefined,
    null,
    true,
    1,
    'foo',
    {},
    { ...validBody, pinned: 'false' },
    { ...validBody, icon: false },
    { ...validBody, title: 1 },
    { ...validBody, body: [] },
    { ...validBody, timeStamp: [] },
  ])('(%o) throws 400 error', async (body: unknown) => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(true)
    const event = createEvent(undefined, undefined, body)

    // Act - Assert
    await expect(postNotification(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getNotificationRepository)).not.toHaveBeenCalled()
  })

  test.each([
    [{ ...validBody, pinned: false }, { ...validBody, timeStamp }, false],
    [{ ...validBody, pinned: true }, { ...validBody, timeStamp }, true],
    [
      { ...validBody, id: 'foo', pinned: true },
      { ...validBody, id: 'foo', timeStamp },
      true,
    ],
    [
      { ...validBody, timeStamp, pinned: false },
      { ...validBody, timeStamp },
      false,
    ],
  ])(
    '(%o) calls NotificationRepository.upsert(%o)',
    async (body, expected, pinned) => {
      // Arrange
      vi.mocked(hasRole).mockReturnValue(true)
      const upsert = vi.fn().mockResolvedValue(notification)
      vi.mocked(getNotificationRepository).mockReturnValue({
        upsert,
      } as unknown as ReturnType<typeof getNotificationRepository>)
      const event = createEvent(undefined, undefined, body)

      // Act
      const result = await postNotification(event)

      // Assert
      expect(result).toStrictEqual({
        id: notification.id,
        color: notification.color,
        icon: notification.icon,
        title: notification.title,
        body: notification.body,
        timeStamp: notification.timeStamp,
      })
      expect(upsert).toHaveBeenCalledWith(expected, pinned)
    }
  )
})
