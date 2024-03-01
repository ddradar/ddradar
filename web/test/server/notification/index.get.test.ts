// @vitest-environment node
import { fetchList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { notifications } from '~/../core/test/data'
import fetchNotificationList from '~~/server/api/v1/notification/index.get'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')

describe('GET /api/v1/notification', () => {
  const result = notifications.map(n => ({
    id: n.id,
    type: n.type,
    icon: n.icon,
    title: n.title,
    body: n.body,
    timeStamp: n.timeStamp,
  }))
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(result as any)
  })
  beforeEach(() => {
    vi.mocked(fetchList).mockClear()
  })

  const defaultCond = { condition: 'c.sender = "SYSTEM"' }
  test.each([
    ['', []],
    ['foo', []],
    ['top', [{ condition: 'c.pinned = true' }]],
    ['TOP', []],
  ])('?scope=%s calls fetchList(..., ..., %o)', async (scope, expected) => {
    // Arrange
    const event = createEvent(undefined, { scope })

    // Act
    const notificationList = await fetchNotificationList(event)

    // Assert
    expect(notificationList).toBe(result)
    const conditions = vi.mocked(fetchList).mock.calls[0][2]
    expect(conditions).toStrictEqual([defaultCond, ...expected])
  })
})
