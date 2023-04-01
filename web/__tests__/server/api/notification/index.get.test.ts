import { notifications } from '@ddradar/core/test/data'
import { fetchList } from '@ddradar/db'
import { getQuery } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import fetchNotificationList from '~/server/api/v1/notification/index.get'

vi.mock('@ddradar/db')
vi.mock('h3')

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
    vi.mocked(getQuery).mockReturnValue({ scope })
    const event = createEvent()

    // Act
    const notificationList = await fetchNotificationList(event)

    // Assert
    expect(notificationList).toBe(result)
    const conditions = vi.mocked(fetchList).mock.calls[0][2]
    expect(conditions).toStrictEqual([defaultCond, ...expected])
  })
})
